import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits, getAddress, getContract, Hash, parseUnits, zeroHash } from 'viem'
import { Toast } from '@/components/common/toast'
import { conditionalTokensABI, fixedProductMarketMakerABI } from '@/contracts'
import { useMarketData, useToast } from '@/hooks'
import {
  getConditionalTokenAddress,
  useConditionalTokensAddr,
} from '@/hooks/use-conditional-tokens-addr'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { publicClient } from '@/providers'
import { ClickEvent, useAmplitude, useBalanceService, useHistory } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { Market, MarketGroup, RedeemParams } from '@/types'
import { NumberUtil, calcSellAmountInCollateral } from '@/utils'
import { DISCORD_LINK } from '@/utils/consts'

interface ITradingServiceContext {
  market: Market | null
  setMarket: (market: Market | null) => void
  marketGroup: MarketGroup | null
  setMarketGroup: (marketGroup: MarketGroup | null) => void
  strategy: 'Buy' | 'Sell'
  setStrategy: (side: 'Buy' | 'Sell') => void
  balanceOfCollateralToSellYes: string
  balanceOfCollateralToSellNo: string
  collateralAmount: string
  setCollateralAmount: (amount: string) => void
  quotesYes: TradeQuotes | null | undefined
  quotesNo: TradeQuotes | null | undefined
  buy: ({
    outcomeTokenId,
    slippage,
  }: {
    outcomeTokenId: number
    slippage: string
  }) => Promise<string | undefined>
  sell: ({
    outcomeTokenId,
    slippage,
  }: {
    outcomeTokenId: number
    slippage: string
  }) => Promise<string | undefined>
  trade: (outcomeTokenId: number, slippage: string) => Promise<string | undefined>
  redeem: (params: RedeemParams) => Promise<string | undefined>
  status: TradingServiceStatus
  tradeStatus: TradingServiceStatus
  approveBuy: () => Promise<void>
  isLoadingRedeem: boolean
  resetQuotes: () => void
  approveSellMutation: UseMutationResult<void, Error, void, unknown>
  checkApprovedForSell: () => Promise<boolean>
  marketFee: number
  marketPageOpened: boolean
  setMarketPageOpened: Dispatch<SetStateAction<boolean>>
  onCloseMarketPage: () => void
  onOpenMarketPage: (market: Market | MarketGroup) => void
}

const TradingServiceContext = createContext({} as ITradingServiceContext)

export const TradingServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * UI HELPERS
   */
  const toast = useToast()

  /**
   * SERVICES
   */
  const queryClient = useQueryClient()
  const { getTrades, getRedeems } = useHistory()
  const { trackClicked } = useAmplitude()
  const account = useWalletAddress()

  /**
   * OPTIONS
   */
  const [market, setMarket] = useState<Market | null>(null)
  const [marketGroup, setMarketGroup] = useState<MarketGroup | null>(null)
  const [strategy, setStrategy] = useState<'Buy' | 'Sell'>('Buy')
  const [marketFee, setMarketFee] = useState(0)
  const [marketPageOpened, setMarketPageOpened] = useState(false)

  const onCloseMarketPage = () => {
    trackClicked(ClickEvent.TradingWidgetReturnDecomposition, {
      mode: 'closed',
      marketCategory: market?.category,
      marketAddress: market?.address,
      marketType: marketGroup ? 'group' : 'single',
      marketTags: market?.tags,
    })
    setMarketPageOpened(false)
    setMarket(null)
    setMarketGroup(null)
  }

  const onOpenMarketPage = (market: Market | MarketGroup) => {
    trackClicked(ClickEvent.TradingWidgetReturnDecomposition, {
      mode: 'open',
      marketCategory: market?.category,
      // @ts-ignore
      marketAddress: market.slug
        ? (market as MarketGroup).markets[0].address
        : (market as Market).address,
      // @ts-ignore
      marketType: market.slug ? 'group' : 'single',
      marketTags: market?.tags,
    })
    // @ts-ignore
    if (market.slug) {
      setMarketGroup(market as MarketGroup)
      setMarket((market as MarketGroup).markets[0])
      !isMobile && setMarketPageOpened(true)
      return
    }
    setMarket(market as Market)
    !isMobile && setMarketPageOpened(true)
  }

  const { data: conditionalTokensAddress, refetch: getConditionalTokensAddress } =
    useConditionalTokensAddr({
      marketAddr: !market ? undefined : getAddress(market.address),
    })
  useEffect(() => {
    getConditionalTokensAddress()
  }, [market])

  // TODO: refactor
  const refetchChain = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensBuyPrice', market?.address],
    })
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensSellPrice', market?.address],
    })
    await refetchbalanceOfSmartWallet()
    await updateSellBalance()
  }

  // TODO: refactor
  const refetchSubgraph = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['marketData', market?.address],
    })
    await getTrades()
    await getRedeems()
  }

  /**
   * CONTRACTS
   * TODO: incapsulate with utils
   */
  const fixedProductMarketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.address,
            abi: fixedProductMarketMakerABI,
            client: publicClient,
          })
        : undefined,
    [market]
  )

  const conditionalTokensContract =
    conditionalTokensAddress &&
    getContract({
      address: conditionalTokensAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })

  /**
   * BALANCE TO BUY
   */
  const { refetchbalanceOfSmartWallet } = useBalanceService()

  /**
   * BALANCE TO SELL
   */
  const [balanceOfOutcomeTokenYes, setBalanceOfOutcomeTokenYes] = useState('0') // getCTBalance
  const [balanceOfOutcomeTokenNo, setBalanceOfOutcomeTokenNo] = useState('0')
  const [balanceOfCollateralToSellYes, setBalanceOfCollateralToSellYes] = useState('0') // ctBalance converted to collateral
  const [balanceOfCollateralToSellNo, setBalanceOfCollateralToSellNo] = useState('0')

  const getCTBalance = async (
    account: Address | undefined,
    outcomeIndex: number
  ): Promise<bigint> => {
    if (!market || !account || !conditionalTokensContract) {
      return 0n
    }
    const collectionId = (await conditionalTokensContract.read.getCollectionId([
      zeroHash, // Since we don't support complicated conditions at the moment
      market.conditionId,
      1 << outcomeIndex,
    ])) as Hash
    const positionId = (await conditionalTokensContract.read.getPositionId([
      market.collateralToken.address,
      collectionId,
    ])) as bigint
    const balance = (await conditionalTokensContract.read.balanceOf([
      account,
      positionId,
    ])) as bigint
    return balance
  }

  const updateSellBalance = useCallback(async () => {
    setBalanceOfOutcomeTokenYes('0')
    setBalanceOfOutcomeTokenNo('0')
    setBalanceOfCollateralToSellYes('0')
    setBalanceOfCollateralToSellNo('0')

    if (!market || !fixedProductMarketMakerContract || strategy != 'Sell') {
      return
    }

    const balanceOfOutcomeTokenBIYes = await getCTBalance(account, 0)
    const _balanceOfOutcomeTokenYes = formatUnits(
      balanceOfOutcomeTokenBIYes,
      market.collateralToken?.decimals || 18
    )
    const balanceOfOutcomeTokenCroppedYes = NumberUtil.toFixed(
      _balanceOfOutcomeTokenYes.toString(),
      10
    )
    setBalanceOfOutcomeTokenYes(balanceOfOutcomeTokenCroppedYes)

    const balanceOfOutcomeTokenBINo = await getCTBalance(account, 1)
    const _balanceOfOutcomeTokenNo = formatUnits(
      balanceOfOutcomeTokenBINo,
      market.collateralToken?.decimals || 18
    )
    const balanceOfOutcomeTokenCroppedNo = NumberUtil.toFixed(
      _balanceOfOutcomeTokenNo.toString(),
      10
    )
    setBalanceOfOutcomeTokenNo(balanceOfOutcomeTokenCroppedNo)

    const holdingsYes = await getCTBalance(market.address, 0)
    const otherHoldingsYes: bigint[] = []
    for (let index = 0; index < 2; index++) {
      if (index != 0) {
        const balance = await getCTBalance(market.address, index)
        otherHoldingsYes.push(balance)
      }
    }
    let balanceOfCollateralToSellBIYes =
      calcSellAmountInCollateral(
        parseUnits(balanceOfOutcomeTokenCroppedYes, market.collateralToken?.decimals || 18),
        holdingsYes,
        otherHoldingsYes,
        Number(marketFee)
      ) ?? 0n
    // small balance to zero
    if (
      balanceOfCollateralToSellBIYes <
      parseUnits('0.000001', market.collateralToken?.decimals || 18)
    ) {
      balanceOfCollateralToSellBIYes = 0n
    }

    const _balanceOfCollateralToSellYes = formatUnits(
      balanceOfCollateralToSellBIYes,
      market.collateralToken?.decimals || 18
    )

    setBalanceOfCollateralToSellYes(_balanceOfCollateralToSellYes)

    const holdingsNo = await getCTBalance(market.address, 1)
    const otherHoldingsNo: bigint[] = []
    for (let index = 0; index < 2; index++) {
      if (index != 1) {
        const balance = await getCTBalance(market.address, index)
        otherHoldingsNo.push(balance)
      }
    }

    let balanceOfCollateralToSellBINo =
      calcSellAmountInCollateral(
        parseUnits(balanceOfOutcomeTokenCroppedNo, market.collateralToken?.decimals || 18),
        holdingsNo,
        otherHoldingsNo,
        Number(marketFee)
      ) ?? 0n
    // small balance to zero
    if (
      balanceOfCollateralToSellBINo < parseUnits('0.000001', market.collateralToken?.decimals || 18)
    ) {
      balanceOfCollateralToSellBINo = 0n
    }

    const _balanceOfCollateralToSellNo = formatUnits(
      balanceOfCollateralToSellBINo,
      market.collateralToken?.decimals || 18
    )

    setBalanceOfCollateralToSellNo(_balanceOfCollateralToSellNo)
  }, [
    account,
    market,
    strategy,
    fixedProductMarketMakerContract,
    conditionalTokensContract?.address,
  ])

  const getMarketFee = async () => {
    const feeBI = (await fixedProductMarketMakerContract?.read.fee()) as bigint
    const fee = Number(formatUnits(feeBI, 18))
    setMarketFee(fee)
  }

  useEffect(() => {
    updateSellBalance()
  }, [market, strategy, fixedProductMarketMakerContract, conditionalTokensContract?.address])

  useEffect(() => {
    if (fixedProductMarketMakerContract) {
      getMarketFee()
    }
  }, [fixedProductMarketMakerContract])

  /**
   * AMOUNT
   */
  const [collateralAmount, setCollateralAmount] = useState<string>('')
  const collateralAmountBI = useMemo(
    () => parseUnits(collateralAmount ?? '0', market?.collateralToken?.decimals || 18),
    [collateralAmount, market?.collateralToken]
  )

  // const isExceedsBalance = useMemo(() => {
  //   if (strategy == 'Buy') {
  //     if (balanceOfSmartWallet) {
  //       const balanceItem = balanceOfSmartWallet.find(
  //         (balance) => balance.contractAddress === market?.collateralToken[defaultChain.id]
  //       )
  //       return Number(collateralAmount) > Number(balanceItem?.formatted)
  //     }
  //     return Number(collateralAmount) > 0
  //   }
  //   return Number(collateralAmount) > Number(balanceOfCollateralToSell)
  // }, [strategy, balanceOfCollateralToSell, collateralAmount, balanceOfSmartWallet, market])

  const isInvalidCollateralAmount = collateralAmountBI <= 0n

  /**
   * QUOTES
   */
  const [quotesYes, setQuotesYes] = useState<TradeQuotes | null>(null)
  const [quotesNo, setQuotesNo] = useState<TradeQuotes | null>(null)
  // current price for price impact calculation
  const {
    outcomeTokensBuyPrice: outcomeTokensBuyPriceCurrent,
    outcomeTokensSellPrice: outcomeTokensSellPriceCurrent,
  } = useMarketData({
    marketAddress: market?.address,
    collateralToken: market?.collateralToken,
  })

  const resetQuotes = () => {
    setQuotesYes(null)
    setQuotesNo(null)
    return
  }

  useQuery({
    queryKey: [
      'tradeQuotesYes',
      // fixedProductMarketMakerContract?.address,
      // collateralAmount,
      // balanceOfOutcomeTokenYes,
      // 0,
      // strategy,
      // outcomeTokensBuyPriceCurrent,
      // outcomeTokensSellPriceCurrent,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
        setQuotesYes(null)
        return null
      }

      let outcomeTokenAmountBI = 0n
      if (strategy == 'Buy') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          0,
        ])) as bigint
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          0,
        ])) as bigint

        // limit max outcome token amount to balance
        const balanceOfOutcomeTokenBI = parseUnits(
          balanceOfOutcomeTokenYes,
          market?.collateralToken?.decimals || 18
        )
        if (outcomeTokenAmountBI > balanceOfOutcomeTokenBI) {
          outcomeTokenAmountBI = balanceOfOutcomeTokenBI
        }
      }

      if (outcomeTokenAmountBI == 0n) {
        setQuotesYes(null)
        return null
      }

      const outcomeTokenAmount = formatUnits(
        outcomeTokenAmountBI,
        market?.collateralToken?.decimals || 18
      )
      const outcomeTokenPrice = (Number(collateralAmount) / Number(outcomeTokenAmount)).toString()
      const roi = ((Number(outcomeTokenAmount) / Number(collateralAmount) - 1) * 100).toString()
      const outcomeTokensPriceCurrent =
        strategy == 'Buy' ? outcomeTokensBuyPriceCurrent : outcomeTokensSellPriceCurrent
      const priceImpact = Math.abs(
        (Number(outcomeTokenPrice) / Number(outcomeTokensPriceCurrent?.[0] ?? 1) - 1) * 100
      ).toString()

      const _quotes: TradeQuotes = {
        outcomeTokenPrice,
        outcomeTokenAmount,
        roi,
        priceImpact,
      }

      setQuotesYes(_quotes)
      return quotesYes
    },
  })

  useQuery({
    queryKey: [
      'tradeQuotesNo',
      // fixedProductMarketMakerContract?.address,
      // collateralAmount,
      // balanceOfOutcomeTokenNo,
      // 1,
      // strategy,
      // outcomeTokensBuyPriceCurrent,
      // outcomeTokensSellPriceCurrent,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
        setQuotesNo(null)
        return null
      }

      let outcomeTokenAmountBI = 0n
      if (strategy == 'Buy') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          1,
        ])) as bigint
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          1,
        ])) as bigint

        // limit max outcome token amount to balance
        const balanceOfOutcomeTokenBI = parseUnits(
          balanceOfOutcomeTokenNo,
          market?.collateralToken?.decimals || 18
        )
        if (outcomeTokenAmountBI > balanceOfOutcomeTokenBI) {
          outcomeTokenAmountBI = balanceOfOutcomeTokenBI
        }
      }

      if (outcomeTokenAmountBI == 0n) {
        setQuotesNo(null)
        return null
      }

      const outcomeTokenAmount = formatUnits(
        outcomeTokenAmountBI,
        market?.collateralToken?.decimals || 18
      )
      const outcomeTokenPrice = (Number(collateralAmount) / Number(outcomeTokenAmount)).toString()
      const roi = ((Number(outcomeTokenAmount) / Number(collateralAmount) - 1) * 100).toString()
      const outcomeTokensPriceCurrent =
        strategy == 'Buy' ? outcomeTokensBuyPriceCurrent : outcomeTokensSellPriceCurrent
      const priceImpact = Math.abs(
        (Number(outcomeTokenPrice) / Number(outcomeTokensPriceCurrent?.[1] ?? 1) - 1) * 100
      ).toString()

      const _quotes: TradeQuotes = {
        outcomeTokenPrice,
        outcomeTokenAmount,
        roi,
        priceImpact,
      }

      setQuotesNo(_quotes)
      return quotesNo
    },
  })

  /**
   * BUY
   */
  const {
    buyOutcomeTokens,
    client,
    approveContract,
    sellOutcomeTokens,
    checkAllowanceForAll,
    approveAllowanceForAll,
    redeemPositions,
  } = useWeb3Service()
  const { mutateAsync: buy, isPending: isLoadingBuy } = useMutation({
    mutationFn: async ({
      outcomeTokenId,
      slippage,
    }: {
      outcomeTokenId: number
      slippage: string
    }) => {
      if (!account || !market || isInvalidCollateralAmount) {
        return
      }

      setCollateralAmount('')

      const outcomeTokenAmount = outcomeTokenId
        ? (quotesNo?.outcomeTokenAmount as string)
        : (quotesYes?.outcomeTokenAmount as string)

      const minOutcomeTokensToBuy = slippage
        ? new BigNumber(outcomeTokenAmount).multipliedBy(1 - +slippage / 100).toFixed(0)
        : outcomeTokenAmount

      const receipt = await buyOutcomeTokens(
        market.address,
        collateralAmountBI,
        outcomeTokenId,
        parseUnits(minOutcomeTokensToBuy, market?.collateralToken?.decimals || 18),
        market.collateralToken.address
      )

      if (!receipt) {
        const id = toast({
          render: () => (
            <Toast
              title={`Unsuccessful transaction.`}
              text={'Please contact our support.'}
              link={DISCORD_LINK}
              linkText='Open Discord'
              id={id}
            />
          ),
        })
        return
      }

      sleep(1).then(async () => {
        await refetchChain()
        await queryClient.refetchQueries({
          queryKey: ['daily-markets'],
        })
        await queryClient.refetchQueries({
          queryKey: ['market', market.address],
        })
      })

      sleep(5).then(async () => {
        await refetchSubgraph()
      })

      return receipt
    },
  })

  const { mutateAsync: approveContractBuy, isPending: isLoadingApproveBuy } = useMutation({
    mutationFn: async () => {
      if (!market) {
        return
      }
      const id = toast({
        render: () => <Toast title={'Processing approve transaction...'} id={id} />,
      })
      try {
        await approveContract(market.address, market.collateralToken.address, collateralAmountBI)
        await sleep(3)
        const id = toast({
          render: () => <Toast title={`Successfully approved. Proceed with buy now.`} id={id} />,
        })
      } catch (e) {
        const id = toast({
          render: () => (
            <Toast title={`Something went wrong during approve transaction broadcast.`} id={id} />
          ),
        })
      }
    },
  })

  const approveSellMutation = useMutation({
    mutationFn: async () => {
      if (!market) {
        return
      }
      const id = toast({
        render: () => <Toast title={'Processing approve transaction...'} id={id} />,
      })
      try {
        await approveAllowanceForAll(market.address, conditionalTokensAddress!)
        await sleep(3)
        const id = toast({
          render: () => <Toast title={`Successfully approved. Proceed with sell now.`} id={id} />,
        })
      } catch (e) {
        // @ts-ignore
        throw new Error(e)
      }
    },
  })

  const checkApprovedForSell = async () => {
    return checkAllowanceForAll(market?.address as Address, conditionalTokensAddress as Address)
  }

  /**
   * SELL
   */
  const { mutateAsync: sell, isPending: isLoadingSell } = useMutation({
    mutationFn: async ({
      outcomeTokenId,
      slippage,
    }: {
      outcomeTokenId: number
      slippage: string
    }) => {
      if (!account || !market || isInvalidCollateralAmount || !conditionalTokensAddress) {
        return
      }

      const outcomeTokenAmount = outcomeTokenId
        ? (quotesNo?.outcomeTokenAmount as string)
        : (quotesYes?.outcomeTokenAmount as string)

      const maxOutcomeTokensToSell = slippage
        ? new BigNumber(outcomeTokenAmount).multipliedBy(1 - +slippage / 100).toFixed(0)
        : outcomeTokenAmount

      const receipt = await sellOutcomeTokens(
        conditionalTokensAddress,
        market.address,
        collateralAmountBI,
        // amount,
        outcomeTokenId,
        parseUnits(
          outcomeTokenId
            ? (quotesNo?.outcomeTokenAmount as string)
            : (quotesYes?.outcomeTokenAmount as string),
          market?.collateralToken?.decimals || 18
        )
      )

      if (!receipt) {
        const id = toast({
          render: () => (
            <Toast
              title={`Unsuccessful transaction`}
              text={'Please contact our support.'}
              link={DISCORD_LINK}
              linkText='Open Discord'
              id={id}
            />
          ),
        })
        return
      }

      setCollateralAmount('')

      await refetchChain()

      const successId = toast({
        render: () => (
          <Toast
            title={`Successfully redeemed ${NumberUtil.toFixed(collateralAmount, 6)} ${
              market.collateralToken.symbol
            }`}
            id={successId}
          />
        ),
      })

      await sleep(1)

      await queryClient.refetchQueries({
        queryKey: ['daily-markets'],
      })
      await queryClient.refetchQueries({
        queryKey: ['market', market.address],
      })

      const updateID = toast({
        render: () => <Toast title={`Updating portfolio...`} id={updateID} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(5).then(async () => {
        await refetchSubgraph()
      })

      return receipt
    },
  })

  /**
   * REDEEM / CLAIM
   */
  const { mutateAsync: redeem, isPending: isLoadingRedeem } = useMutation({
    mutationFn: async ({
      outcomeIndex,
      marketAddress,
      collateralAddress,
      conditionId,
    }: RedeemParams) => {
      const conditionalTokenAddress = await getConditionalTokenAddress(getAddress(marketAddress))

      const receipt = await redeemPositions(
        conditionalTokenAddress,
        collateralAddress,
        zeroHash,
        conditionId,
        [1 << outcomeIndex]
      )

      if (!receipt) {
        const id = toast({
          render: () => (
            <Toast
              title={`Unsuccessful transaction`}
              text={'Please contact our support.'}
              link={DISCORD_LINK}
              linkText='Open Discord'
              id={id}
            />
          ),
        })
        return
      }

      await refetchChain()

      const id = toast({
        render: () => <Toast title={`Successfully redeemed`} id={id} />,
      })

      await sleep(1)

      const updateId = toast({
        render: () => <Toast title={`Updating portfolio...`} id={updateId} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => refetchSubgraph())

      return receipt
    },
  })

  const trade = useCallback(
    // (outcomeTokenId: number) => buy(outcomeTokenId),
    (outcomeTokenId: number, slippage: string) =>
      strategy == 'Buy' ? buy({ outcomeTokenId, slippage }) : sell({ outcomeTokenId, slippage }),
    [strategy]
  )

  const approveBuy = useCallback(() => approveContractBuy(), [])

  /**
   * STATUS
   */
  const status = useMemo<TradingServiceStatus>(() => {
    if (isLoadingBuy || isLoadingSell || isLoadingRedeem || isLoadingApproveBuy) {
      return 'Loading'
    }
    if (isInvalidCollateralAmount) {
      return 'InvalidAmount'
    }
    return 'Ready'
  }, [isInvalidCollateralAmount, isLoadingBuy, isLoadingSell, isLoadingRedeem, isLoadingApproveBuy])

  const tradeStatus = useMemo<TradingServiceStatus>(() => {
    if (isLoadingBuy || isLoadingSell) {
      return 'Loading'
    }
    return 'Ready'
  }, [])

  const contextProviderValue: ITradingServiceContext = {
    market,
    marketGroup,
    setMarketGroup,
    checkApprovedForSell,
    setMarket,
    strategy,
    setStrategy,
    collateralAmount,
    setCollateralAmount,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
    quotesYes,
    quotesNo,
    buy,
    sell,
    trade,
    redeem,
    status,
    tradeStatus,
    approveBuy,
    approveSellMutation,
    isLoadingRedeem,
    resetQuotes,
    marketFee,
    marketPageOpened,
    setMarketPageOpened,
    onCloseMarketPage,
    onOpenMarketPage,
  }

  return (
    <TradingServiceContext.Provider value={contextProviderValue}>
      {children}
    </TradingServiceContext.Provider>
  )
}

export const useTradingService = () => useContext(TradingServiceContext)

export type TradingServiceStatus =
  | 'Disconnected'
  | 'InvalidAmount'
  | 'Ready'
  | 'Submitted'
  | 'Loading'
  | 'Idle'

export type TradeQuotes = {
  outcomeTokenAmount: string // amount of outcome token to be traded based on collateral amount input or ctBalance
  outcomeTokenPrice: string // average cost per outcome token
  roi: string // return on investment aka profitability percentage
  priceImpact: string // price fluctuation percentage
}
