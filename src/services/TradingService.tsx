import { Toast } from '@/components'
import { defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI } from '@/contracts'
import { useMarketData, useToast } from '@/hooks'
import { useConditionalTokensAddr } from '@/hooks/use-conditional-tokens-addr'
import { useToken } from '@/hooks/use-token'
import { publicClient } from '@/providers'
import { useAccount, useBalanceService, useEtherspot, useHistory } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { Market } from '@/types'
import { NumberUtil, calcSellAmountInCollateral } from '@/utils'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import { Address, Hash, formatUnits, getAddress, getContract, parseUnits, zeroHash } from 'viem'

interface ITradingServiceContext {
  market: Market | null
  setMarket: (market: Market | null) => void
  strategy: 'Buy' | 'Sell'
  setStrategy: (side: 'Buy' | 'Sell') => void
  outcomeTokenId: number
  setOutcomeTokenId: (outcomeOption: number) => void
  balanceOfCollateralToSell: string
  collateralAmount: string
  setCollateralAmount: (amount: string) => void
  isExceedsBalance: boolean
  quotes: TradeQuotes | null | undefined
  buy: () => Promise<string | undefined>
  sell: () => Promise<string | undefined>
  trade: () => Promise<string | undefined>
  redeem: (outcomeIndex: number) => Promise<string | undefined>
  status: TradingServiceStatus
  approveModalOpened: boolean
  setApproveModalOpened: Dispatch<SetStateAction<boolean>>
  // approveBuy: () => Promise<void>
  // approveSell: () => Promise<void>
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

  /**
   * ACCOUNT
   */
  const { account } = useAccount()

  /**
   * OPTIONS
   */
  const [market, setMarket] = useState<Market | null>(null)
  const [strategy, setStrategy] = useState<'Buy' | 'Sell'>('Buy')
  const [outcomeTokenId, setOutcomeTokenId] = useState(0)
  const [approveModalOpened, setApproveModalOpened] = useState(false)

  /**
   * REFRESH / REFETCH
   */
  const pathname = usePathname()
  useEffect(() => {
    if (pathname.includes('markets/0x')) {
      return
    }
    setMarket(null)
    setCollateralAmount('')
    setStrategy('Buy')
    setOutcomeTokenId(0)
  }, [pathname])

  // const { data: conditionalTokensAddress, refetch: getConditionalTokensAddress } =
  //   useConditionalTokensAddr({
  //     marketAddr: !market ? undefined : getAddress(market.address[defaultChain.id]),
  //   })
  // useEffect(() => {
  //   if (!market) {
  //     getConditionalTokensAddress()
  //   }
  // }, [market])

  // TODO: refactor
  const refetchChain = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensBuyPrice', market?.address[defaultChain.id]],
    })
    await queryClient.invalidateQueries({
      queryKey: ['outcomeTokensSellPrice', market?.address[defaultChain.id]],
    })
    await refetchbalanceOfSmartWallet()
    // await updateSellBalance()
  }

  // TODO: refactor
  const refetchSubgraph = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['marketData', market?.address[defaultChain.id]],
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
            address: market.address[defaultChain.id],
            abi: fixedProductMarketMakerABI,
            client: publicClient,
          })
        : undefined,
    [market]
  )

  // const conditionalTokensContract = getContract({
  //   address: conditionalTokensAddress!,
  //   abi: conditionalTokensABI,
  //   client: publicClient,
  // })

  const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])

  /**
   * BALANCE TO BUY
   */
  const { balanceOfSmartWallet, refetchbalanceOfSmartWallet } = useBalanceService()

  /**
   * BALANCE TO SELL
   */
  const [balanceOfOutcomeToken, setBalanceOfOutcomeToken] = useState('0') // getCTBalance
  const [balanceOfCollateralToSell, setBalanceOfCollateralToSell] = useState('0') // ctBalance converted to collateral

  // const getCTBalance = async (
  //   account: Address | undefined,
  //   outcomeIndex: number
  // ): Promise<bigint> => {
  //   if (!market || !account) {
  //     return 0n
  //   }
  //   const collectionId = (await conditionalTokensContract.read.getCollectionId([
  //     zeroHash, // Since we don't support complicated conditions at the moment
  //     market.conditionId[defaultChain.id],
  //     1 << outcomeIndex,
  //   ])) as Hash
  //   const positionId = (await conditionalTokensContract.read.getPositionId([
  //     market.collateralToken[defaultChain.id],
  //     collectionId,
  //   ])) as bigint
  //   const balance = (await conditionalTokensContract.read.balanceOf([
  //     account,
  //     positionId,
  //   ])) as bigint
  //   return balance
  // }

  // const updateSellBalance = useCallback(async () => {
  //   setBalanceOfCollateralToSell('0')
  //   setBalanceOfOutcomeToken('0')
  //
  //   if (!market || !fixedProductMarketMakerContract || strategy != 'Sell') {
  //     return
  //   }
  //
  //   const balanceOfOutcomeTokenBI = await getCTBalance(account, outcomeTokenId)
  //   const _balanceOfOutcomeToken = formatUnits(
  //     balanceOfOutcomeTokenBI,
  //     collateralToken?.decimals || 18
  //   )
  //   const balanceOfOutcomeTokenCropped = NumberUtil.toFixed(_balanceOfOutcomeToken.toString(), 10)
  //   setBalanceOfOutcomeToken(balanceOfOutcomeTokenCropped)
  //
  //   const holdings = await getCTBalance(market.address[defaultChain.id], outcomeTokenId)
  //   const otherHoldings: bigint[] = []
  //   for (let index = 0; index < market.outcomeTokens.length; index++) {
  //     if (index != outcomeTokenId) {
  //       const balance = await getCTBalance(market.address[defaultChain.id], index)
  //       otherHoldings.push(balance)
  //     }
  //   }
  //   const feeBI = (await fixedProductMarketMakerContract.read.fee()) as bigint
  //   const fee = Number(formatUnits(feeBI, 18))
  //   let balanceOfCollateralToSellBI =
  //     calcSellAmountInCollateral(
  //       parseUnits(balanceOfOutcomeTokenCropped, collateralToken?.decimals || 18),
  //       holdings,
  //       otherHoldings,
  //       fee
  //     ) ?? 0n
  //   // small balance to zero
  //   if (balanceOfCollateralToSellBI < parseUnits('0.000001', collateralToken?.decimals || 18)) {
  //     balanceOfCollateralToSellBI = 0n
  //   }
  //
  //   const _balanceOfCollateralToSell = formatUnits(
  //     balanceOfCollateralToSellBI,
  //     collateralToken?.decimals || 18
  //   )
  //
  //   setBalanceOfCollateralToSell(_balanceOfCollateralToSell)
  // }, [account, market, outcomeTokenId, strategy])
  //
  // useEffect(() => {
  //   updateSellBalance()
  // }, [market, outcomeTokenId, strategy])

  /**
   * AMOUNT
   */
  const [collateralAmount, setCollateralAmount] = useState<string>('')
  const collateralAmountBI = useMemo(
    () => parseUnits(collateralAmount ?? '0', collateralToken?.decimals || 18),
    [collateralAmount, collateralToken]
  )

  const isExceedsBalance = useMemo(() => {
    if (strategy == 'Buy') {
      if (balanceOfSmartWallet) {
        const balanceItem = balanceOfSmartWallet.find(
          (balance) => balance.contractAddress === market?.collateralToken[defaultChain.id]
        )
        return Number(collateralAmount) > Number(balanceItem?.formatted)
      }
      return Number(collateralAmount) > 0
    }
    return Number(collateralAmount) > Number(balanceOfCollateralToSell)
  }, [strategy, balanceOfCollateralToSell, collateralAmount, balanceOfSmartWallet, market])

  const isInvalidCollateralAmount = collateralAmountBI <= 0n || isExceedsBalance

  /**
   * QUOTES
   */
  const [quotes, setQuotes] = useState<TradeQuotes | null>(null)
  // current price for price impact calculation
  const {
    outcomeTokensBuyPrice: outcomeTokensBuyPriceCurrent,
    outcomeTokensSellPrice: outcomeTokensSellPriceCurrent,
  } = useMarketData({
    marketAddress: market?.address[defaultChain.id],
    collateralToken,
  })

  useQuery({
    queryKey: [
      'tradeQuotes',
      fixedProductMarketMakerContract?.address,
      collateralAmount,
      balanceOfOutcomeToken,
      outcomeTokenId,
      strategy,
      outcomeTokensBuyPriceCurrent,
      outcomeTokensSellPriceCurrent,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
        setQuotes(null)
        return null
      }

      let outcomeTokenAmountBI = 0n
      if (strategy == 'Buy') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
          collateralAmountBI,
          outcomeTokenId,
        ])) as bigint
      } else if (strategy == 'Sell') {
        outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
          collateralAmountBI,
          outcomeTokenId,
        ])) as bigint

        // limit max outcome token amount to balance
        const balanceOfOutcomeTokenBI = parseUnits(
          balanceOfOutcomeToken,
          collateralToken?.decimals || 18
        )
        if (outcomeTokenAmountBI > balanceOfOutcomeTokenBI) {
          outcomeTokenAmountBI = balanceOfOutcomeTokenBI
        }
      }

      if (outcomeTokenAmountBI == 0n) {
        setQuotes(null)
        return null
      }

      const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, collateralToken?.decimals || 18)
      const outcomeTokenPrice = (Number(collateralAmount) / Number(outcomeTokenAmount)).toString()
      const roi = ((Number(outcomeTokenAmount) / Number(collateralAmount) - 1) * 100).toString()
      const outcomeTokensPriceCurrent =
        strategy == 'Buy' ? outcomeTokensBuyPriceCurrent : outcomeTokensSellPriceCurrent
      const priceImpact = Math.abs(
        (Number(outcomeTokenPrice) / Number(outcomeTokensPriceCurrent?.[outcomeTokenId] ?? 1) - 1) *
          100
      ).toString()

      const _quotes: TradeQuotes = {
        outcomeTokenPrice,
        outcomeTokenAmount,
        roi,
        priceImpact,
      }

      setQuotes(_quotes)
      return quotes
    },
  })

  /**
   * BUY
   */
  // const {
  //   buyOutcomeTokens,
  //   client,
  //   checkAllowance,
  //   approveContract,
  //   sellOutcomeTokens,
  //   checkAllowanceForAll,
  //   approveAllowanceForAll,
  //   redeemPositions,
  // } = useWeb3Service()
  const { etherspot } = useEtherspot()
  const { mutateAsync: buy, isPending: isLoadingBuy } = useMutation({
    mutationFn: async () => {
      if (!account || !market || isInvalidCollateralAmount || !quotes) {
        return
      }

      // TODO: incapsulate

      // if (client === 'eoa') {
      //   const allowance = await checkAllowance(
      //     market.address[defaultChain.id],
      //     market.collateralToken[defaultChain.id]
      //   )
      //
      //   if (allowance < collateralAmountBI) {
      //     setApproveModalOpened(true)
      //     return
      //   }
      // }
      //
      // toast({
      //   render: () => <Toast title={'Processing transaction...'} />,
      // })

      const receipt = await etherspot?.buyOutcomeTokens(
        market.address[defaultChain.id],
        collateralAmountBI,
        outcomeTokenId,
        parseUnits(quotes.outcomeTokenAmount, collateralToken?.decimals || 18),
        market.collateralToken[defaultChain.id]
      )

      if (!receipt) {
        toast({
          render: () => <Toast title={`Unsuccessful transaction. Please, contact our support.`} />,
        })
        return
      }

      setCollateralAmount('')

      await refetchChain()

      // TODO: incapsulate
      toast({
        render: () => (
          <Toast
            title={`Successfully invested ${NumberUtil.toFixed(collateralAmount, 6)} ${
              collateralToken?.symbol
            }`}
          />
        ),
      })

      await sleep(1)

      toast({
        render: () => <Toast title={`Updating portfolio...`} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => refetchSubgraph())

      return receipt
    },
  })

  // const { mutateAsync: approveContractBuy, isPending: isLoadingApproveBuy } = useMutation({
  //   mutationFn: async () => {
  //     if (!market) {
  //       return
  //     }
  //     toast({
  //       render: () => <Toast title={'Processing approve transaction...'} />,
  //     })
  //     try {
  //       await approveContract(
  //         market.address[defaultChain.id],
  //         market.collateralToken[defaultChain.id]
  //       )
  //       toast({
  //         render: () => <Toast title={`Successfully approved. Proceed with buy now.`} />,
  //       })
  //       await sleep(3)
  //     } catch (e) {
  //       toast({
  //         render: () => (
  //           <Toast title={`Something went wrong during approve transaction broadcast.`} />
  //         ),
  //       })
  //     }
  //   },
  // })
  //
  // const { mutateAsync: approveContractSell, isPending: isLoadingApproveSell } = useMutation({
  //   mutationFn: async () => {
  //     if (!market) {
  //       return
  //     }
  //     toast({
  //       render: () => <Toast title={'Processing approve transaction...'} />,
  //     })
  //     try {
  //       await approveAllowanceForAll(market.address[defaultChain.id], conditionalTokensAddress!)
  //       toast({
  //         render: () => <Toast title={`Successfully approved. Proceed with sell now.`} />,
  //       })
  //       await sleep(3)
  //     } catch (e) {
  //       toast({
  //         render: () => (
  //           <Toast title={`Something went wrong during approve transaction broadcast.`} />
  //         ),
  //       })
  //     }
  //   },
  // })

  /**
   * SELL
   */
  const { mutateAsync: sell, isPending: isLoadingSell } = useMutation({
    mutationFn: async () => {
      if (!account || !market || isInvalidCollateralAmount || !quotes) {
        return
      }

      // TODO: incapsulate
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })

      // if (client === 'eoa') {
      //   const approvedForAll = await checkAllowanceForAll(
      //     market.address[defaultChain.id],
      //     conditionalTokensAddress!
      //   )
      //
      //   if (!approvedForAll) {
      //     setApproveModalOpened(true)
      //     return
      //   }
      // }

      const receipt = ''

      // const receipt = await etherspot?.sellOutcomeTokens(
      //   conditionalTokensAddress!,
      //   market.address[defaultChain.id],
      //   collateralAmountBI,
      //   outcomeTokenId,
      //   parseUnits(quotes.outcomeTokenAmount, collateralToken?.decimals || 18)
      // )

      if (!receipt) {
        toast({
          render: () => <Toast title={`Unsuccessful transaction. Please, contact our support.`} />,
        })
        return
      }

      setCollateralAmount('')

      await refetchChain()

      toast({
        render: () => (
          <Toast
            title={`Successfully redeemed ${NumberUtil.toFixed(collateralAmount, 6)} ${
              collateralToken?.symbol
            }`}
          />
        ),
      })

      await sleep(1)

      toast({
        render: () => <Toast title={`Updating portfolio...`} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => refetchSubgraph())

      return receipt
    },
  })

  /**
   * REDEEM / CLAIM
   */
  const { mutateAsync: redeem, isPending: isLoadingRedeem } = useMutation({
    mutationFn: async (outcomeIndex: number) => {
      if (!market) {
        return
      }

      const receipt = ''

      // const receipt = await etherspot?.redeemPositions(
      //   conditionalTokensAddress!,
      //   market.collateralToken[defaultChain.id],
      //   zeroHash,
      //   market.conditionId[defaultChain.id],
      //   [1 << outcomeIndex]
      // )

      if (!receipt) {
        toast({
          render: () => <Toast title={`Unsuccessful transaction. Please, contact our support.`} />,
        })
        return
      }

      await refetchChain()

      toast({
        render: () => <Toast title={`Successfully redeemed`} />,
      })

      await sleep(1)

      toast({
        render: () => <Toast title={`Updating portfolio...`} />,
      })

      // TODO: redesign subgraph refetch logic
      sleep(10).then(() => refetchSubgraph())

      return receipt
    },
  })

  const trade = useCallback(() => (strategy == 'Buy' ? buy() : sell()), [strategy])

  // const approveBuy = useCallback(() => approveContractBuy(), [])
  //
  // const approveSell = useCallback(() => approveContractSell(), [])

  /**
   * STATUS
   */
  const status = useMemo<TradingServiceStatus>(() => {
    if (
      isLoadingBuy ||
      isLoadingSell ||
      isLoadingRedeem
      // isLoadingApproveBuy ||
      // isLoadingApproveSell
    ) {
      return 'Loading'
    }
    if (isInvalidCollateralAmount) {
      return 'InvalidAmount'
    }
    return 'Ready'
  }, [
    isInvalidCollateralAmount,
    isLoadingBuy,
    isLoadingSell,
    isLoadingRedeem,
    // isLoadingApproveBuy,
    // isLoadingApproveSell,
  ])

  const contextProviderValue: ITradingServiceContext = {
    market,
    setMarket,
    strategy,
    setStrategy,
    outcomeTokenId,
    setOutcomeTokenId,
    collateralAmount,
    setCollateralAmount,
    isExceedsBalance,
    balanceOfCollateralToSell,
    quotes,
    buy,
    sell,
    trade,
    redeem,
    status,
    approveModalOpened,
    setApproveModalOpened,
    // approveBuy,
    // approveSell,
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
