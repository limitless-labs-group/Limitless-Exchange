import { defaultChain } from '@/constants'
import { wethABI } from '@/contracts'
import { useToast } from '@/hooks'
import { usePriceOracle } from '@/providers'
import { useEtherspot, useLimitlessApi } from '@/services'
import { Address, GetBalanceResult, MarketTokensIds, Token } from '@/types'
import { Logger, NumberUtil } from '@/utils'
import {
  QueryObserverResult,
  UseMutateAsyncFunction,
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  erc20Abi,
  formatEther,
  formatUnits,
  getContract,
  isAddress,
  parseEther,
  parseUnits,
} from 'viem'
import { getBalance } from 'viem/actions'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useWeb3Service } from '@/services/Web3Service'
import { publicClient } from '@/providers'
import { Toast } from '@/components/common/toast'
import { ToastWithdraw } from '@/components/common/toast-withdraw'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'

interface IBalanceService {
  balanceOfSmartWallet: GetBalanceResult[] | undefined
  refetchbalanceOfSmartWallet: () => Promise<
    QueryObserverResult<GetBalanceResult[] | undefined, Error>
  >
  overallBalanceUsd: string

  mint: (params: { address: Address; newToken?: boolean }) => void
  isLoadingMint: boolean

  amount: string
  setAmount: (amount: string) => void
  unwrap: boolean
  setUnwrap: (unwrap: boolean) => void
  withdraw: UseMutateAsyncFunction<
    void,
    Error,
    { receiver: string; token: Token; amount: string },
    unknown
  >

  status: BalanceServiceStatus
  setToken: Dispatch<SetStateAction<Token | null>>
  token: Token | null

  eoaWrapModalOpened: boolean
  setEOAWrapModalOpened: Dispatch<SetStateAction<boolean>>

  ethBalance?: string
  wrapETHManual: (amount: string) => Promise<void>
  isWrapPending: boolean
}

const BalanceService = createContext({} as IBalanceService)

export const useBalanceService = () => useContext(BalanceService)

export const BalanceServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * Helpers
   */
  const toast = useToast()
  const log = new Logger(BalanceServiceProvider.name)
  const pathname = usePathname()
  const { marketTokensPrices, convertAssetAmountToUsd } = usePriceOracle()
  const [eoaWrapModalOpened, setEOAWrapModalOpened] = useState(false)

  /**
   * Etherspot
   */
  // Todo rework
  const { whitelist, etherspot } = useEtherspot()

  const walletAddress = useWalletAddress()

  const { mintErc20, transferErc20, unwrapEth, transferEthers, wrapEth } = useWeb3Service()

  const { supportedTokens } = useLimitlessApi()

  /**
   * Weth balance
   */
  const { data: balanceOfSmartWallet, refetch: refetchbalanceOfSmartWallet } = useQuery({
    queryKey: ['balance', walletAddress],
    queryFn: async () => {
      if (!walletAddress && !supportedTokens) {
        return
      }

      const multicall = new Multicall({
        ethersProvider: new ethers.providers.JsonRpcProvider(
          defaultChain.rpcUrls.default.http.toString()
        ),
        tryAggregate: true,
      })

      //@ts-ignore
      const contractCallContext: ContractCallContext[] = supportedTokens?.map((token) => ({
        reference: token.address,
        contractAddress: token.address,
        abi: token.priceOracleId === MarketTokensIds.WETH ? wethABI : erc20Abi,
        calls: [
          { reference: 'balance', methodName: 'balanceOf', methodParameters: [walletAddress] },
        ],
      }))
      let balanceResult: GetBalanceResult[]

      try {
        const results = await multicall.call(contractCallContext)

        //@ts-ignore
        balanceResult = supportedTokens?.map((token) => {
          const result = results.results[token.address]
          const balance = BigInt(result.callsReturnContext[0].returnValues[0].hex)
          let formatted = formatUnits(balance, token.decimals)

          if (Number(formatted) < 0.00001) {
            //Filter small balances
            formatted = '0'
          }

          return {
            symbol: token.symbol,
            id: token.priceOracleId,
            name: token.name,
            decimals: token.decimals,
            value: balance,
            formatted: formatted,
            image: token.logoUrl,
            contractAddress: token.address,
            price: marketTokensPrices ? marketTokensPrices[token.priceOracleId].usd : 0,
          } as GetBalanceResult
        })
      } catch (err) {
        //@ts-ignore
        balanceResult = supportedTokens?.map((token) => {
          return {
            symbol: token.symbol,
            id: token.priceOracleId,
            name: token.name,
            decimals: token.decimals,
            value: 0n,
            formatted: formatUnits(0n, token.decimals),
            image: token.logoUrl,
            contractAddress: token.address,
            price: marketTokensPrices ? marketTokensPrices[token.priceOracleId].usd : 0,
          } as GetBalanceResult
        })
      }

      log.success('ON_BALANCE_SUCC', walletAddress, balanceResult)

      balanceResult.forEach((balance) => {
        if (!!balanceOfSmartWallet) {
          const currentBalance = balanceOfSmartWallet.find((currentBalanceEntity) => {
            return currentBalanceEntity.id === balance.id
          })
          if (currentBalance && balance.value > currentBalance.value) {
            !defaultChain.testnet && etherspot && whitelist()
            const depositAmount = formatUnits(
              balance.value - currentBalance.value,
              currentBalance.decimals
            )

            toast({
              render: () => (
                <Toast
                  title={`Balance top up: ${NumberUtil.toFixed(depositAmount, 6)} ${
                    balance.symbol
                  }`}
                />
              ),
            })
          }
        }
      })

      return balanceResult
    },
    enabled: !!walletAddress && !!supportedTokens,
    refetchInterval: 10000,
  })

  const { data: ethBalance } = useQuery({
    queryKey: ['ethBalance', walletAddress],
    queryFn: async () => {
      if (!walletAddress || !!etherspot) {
        return
      }
      const eth = await getBalance(publicClient, { address: walletAddress })
      return formatEther(eth)
    },
  })

  const overallBalanceUsd = useMemo(() => {
    let _overallBalanceUsd = 0
    balanceOfSmartWallet?.forEach((balanceResult) => {
      _overallBalanceUsd += convertAssetAmountToUsd(balanceResult.id, balanceResult.formatted)
    })
    return NumberUtil.toFixed(_overallBalanceUsd, 2)
  }, [balanceOfSmartWallet])

  /**
   * Auto-wrap/unwrap Eth
   */
  const [unwrap, setUnwrap] = useState(false) // unwrap on withdrawal

  // disable unwrapping
  useEffect(() => {
    setUnwrap(false)
  }, [pathname])

  useQuery({
    queryKey: ['autoWrapEth', walletAddress, unwrap],
    queryFn: async () => {
      if (!walletAddress || unwrap || !etherspot) {
        return
      }

      const eth = await getBalance(publicClient, { address: walletAddress })
      const ethFormatted = formatEther(eth)
      log.info('ETH balance:', ethFormatted)

      const gasFee = defaultChain.testnet ? 0.01 : 0 // there's no paymaster on testnet so it's required to left some eth for gas

      if (Number(ethFormatted) > gasFee) {
        if (!defaultChain.testnet && etherspot) {
          await whitelist() // TODO: refactor the logic of whitelisting
        }

        toast({
          render: () => <Toast title={'Wrapping ETH...'} />,
        })

        const txHash = await etherspot.wrapEth(eth - parseEther(gasFee.toString()))

        setUnwrap(true)

        if (!txHash) {
          // TODO: show toast?
          log.error('autoWrapEth')
        } else {
          log.success('autoWrapEth', txHash)
        }
      }
    },
    enabled: !!walletAddress && !unwrap,
    refetchInterval: pathname.includes('wallet') && 10000, // polling on wallet page only
  })

  const { mutateAsync: wrapETHManual, isPending: isWrapPending } = useMutation({
    mutationFn: async (amount: string) => {
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })
      await wrapEth(parseUnits(amount, 18))
      setEOAWrapModalOpened(false)
      toast({
        render: () => <Toast title={'ETH wrapped successfully.'} />,
      })
    },
  })

  /**
   * Mint mocked erc20
   */
  const { mutate: mint, isPending: isLoadingMint } = useMutation({
    mutationFn: async (params: { address: Address; newToken?: boolean }) => {
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })
      const token = supportedTokens?.find((token) => token.address === params.address)
      await mintErc20(
        params.address,
        parseUnits('1', token?.decimals || 18),
        walletAddress || '0x',
        params.newToken
      )
      toast({
        render: () => <Toast title={'Confirmed. Updating balance...'} />,
      })
      await refetchbalanceOfSmartWallet()
    },
  })

  // Amount to be withdrawn
  const [amount, setAmount] = useState<string>('')
  const [token, setToken] = useState<Token | null>(supportedTokens ? supportedTokens[0] : null)
  const amountBI = useMemo(() => parseUnits(amount ?? '0', token?.decimals || 18), [amount])
  const isInvalidAmount = useMemo(() => {
    if (token) {
      const isInvalidBalance = balanceOfSmartWallet === undefined
      const isNegativeOrZeroAmount = amountBI <= 0n
      const balanceEntity = balanceOfSmartWallet?.find((balance) => {
        return balance.id === token?.priceOracleId
      }) as GetBalanceResult
      const isExceedsBalance = !!balanceOfSmartWallet && amountBI > balanceEntity.value
      return isInvalidBalance || isNegativeOrZeroAmount || isExceedsBalance
    }
    return false
  }, [balanceOfSmartWallet, amountBI, token])

  // Mutation
  const { mutateAsync: withdraw, isPending: isLoadingWithdraw } = useMutation({
    mutationFn: async ({
      receiver,
      token,
      amount,
    }: {
      receiver: string
      token: Token
      amount: string
    }) => {
      if (unwrap) {
        toast({
          render: () => <Toast title={'Unwrapping ETH...'} />,
        })

        const amountBI = parseUnits(amount, token.decimals)

        const unwrapReceipt = await unwrapEth(amountBI)
        if (!unwrapReceipt) {
          // TODO: show error toast
          log.error('Unwrap is unsuccessful')
          return
        }

        await refetchbalanceOfSmartWallet()

        toast({
          render: () => <Toast title={'Sending ETH...'} />,
        })

        const transferReceipt = await transferEthers(receiver as Address, amountBI)

        if (!transferReceipt) {
          // TODO: show error toast
          log.error('Transfer ETH is unsuccessful')
          return
        }

        setAmount('')
        setUnwrap(false)

        toast({
          render: () => <ToastWithdraw transactionHash={transferReceipt} />,
        })

        return
      }

      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })
      const transferReceipt = await transferErc20(
        token.address as Address,
        receiver as Address,
        amountBI
      )

      if (!transferReceipt) {
        // TODO: show error toast
        log.error(`Transfer ${token?.symbol} is unsuccessful`)
        return
      }
      setAmount('')

      toast({
        render: () => <ToastWithdraw transactionHash={transferReceipt} />,
      })
    },
  })

  /**
   * UI STATUS
   */
  const status: BalanceServiceStatus = useMemo(() => {
    if (isLoadingMint || isLoadingWithdraw) {
      return 'Loading'
    }
    if (isInvalidAmount) {
      return 'InvalidAmount'
    }
    return 'ReadyToFund'
  }, [isInvalidAmount, isLoadingMint, isLoadingWithdraw])

  return (
    <BalanceService.Provider
      value={{
        balanceOfSmartWallet,
        refetchbalanceOfSmartWallet,
        overallBalanceUsd,
        mint,
        isLoadingMint,
        amount,
        setAmount,
        unwrap,
        setUnwrap,
        withdraw,
        setToken,
        token,
        status,
        eoaWrapModalOpened,
        setEOAWrapModalOpened,
        ethBalance,
        wrapETHManual,
        isWrapPending,
      }}
    >
      {children}
    </BalanceService.Provider>
  )
}

export type BalanceServiceStatus =
  | 'WalletNotConnected'
  | 'WrongNetwork'
  | 'InvalidAmount'
  | 'InvalidAddress'
  | 'ExceedsAllowance'
  | 'ReadyToFund'
  | 'FundingSubmitted'
  | 'Loading'
  | 'Idle'
