import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { usePathname } from 'next/navigation'
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
import { erc20Abi, formatEther, formatUnits, parseUnits } from 'viem'
import { getBalance } from 'viem/actions'
import { Toast } from '@/components/common/toast'
import { ToastWithdraw } from '@/components/common/toast-withdraw'
import { defaultChain } from '@/constants'
import { wethABI } from '@/contracts'
import { useToast } from '@/hooks'
import { usePriceOracle } from '@/providers'
import { publicClient } from '@/providers/Privy'
import { useAccount, useLimitlessApi } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { Address, GetBalanceResult, MarketTokensIds, Token } from '@/types'
import { Logger, NumberUtil } from '@/utils'

interface IBalanceService {
  overallBalanceUsd: string

  amount: string
  setAmount: (amount: string) => void
  unwrap: boolean
  setUnwrap: (unwrap: boolean) => void
  withdrawMutation: UseMutationResult<
    void,
    Error,
    { receiver: string; token: Token; amount: string },
    unknown
  >

  status: BalanceServiceStatus
  setToken: Dispatch<SetStateAction<Token | null>>
  token: Token | null

  ethBalance?: string
  wrapMutation: UseMutationResult<void, Error, string, unknown>
  unwrapMutation: UseMutationResult<void, Error, string, unknown>
  balanceLoading: boolean
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
  const { convertAssetAmountToUsd } = usePriceOracle()
  const { profileData, profileLoading, account } = useAccount()
  const { balanceOfSmartWallet, refetchbalanceOfSmartWallet, balanceOfSmartWalletLoading } =
    useBalanceQuery()

  const { transferErc20, unwrapEth, transferEthers, wrapEth } = useWeb3Service()

  const { supportedTokens } = useLimitlessApi()

  const userMenuLoading = useMemo(() => {
    if (account) {
      return profileData === undefined || profileLoading
    }
    return false
  }, [account, profileLoading, profileData])

  const balanceLoading = userMenuLoading || balanceOfSmartWalletLoading

  const { data: ethBalance } = useQuery({
    queryKey: ['ethBalance', account],
    queryFn: async () => {
      if (!account) {
        return
      }
      const eth = await getBalance(publicClient, { address: account })
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

  const wrapMutation = useMutation({
    mutationFn: async (amount: string) => {
      await wrapEth(parseUnits(amount, 18))
    },
  })

  const unwrapMutation = useMutation({
    mutationFn: async (amount: string) => {
      await unwrapEth(parseUnits(amount, 18))
    },
  })

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
  const withdrawMutation = useMutation({
    mutationFn: async ({
      receiver,
      token,
      amount,
    }: {
      receiver: string
      token: Token
      amount: string
    }) => {
      const amountBI = parseUnits(amount, token.decimals)
      if (unwrap) {
        const id = toast({
          render: () => <Toast title={'Unwrapping ETH...'} id={id} />,
        })

        const unwrapReceipt = await unwrapEth(amountBI)
        if (!unwrapReceipt) {
          // TODO: show error toast
          log.error('Unwrap is unsuccessful')
          return
        }

        await refetchbalanceOfSmartWallet()

        const toastId = toast({
          render: () => <Toast title={'Sending ETH...'} id={toastId} />,
        })

        const transferReceipt = await transferEthers(receiver as Address, amountBI)

        if (!transferReceipt) {
          // TODO: show error toast
          log.error('Transfer ETH is unsuccessful')
          return
        }

        setAmount('')
        setUnwrap(false)

        const toastWithdrawId = toast({
          render: () => <ToastWithdraw transactionHash={transferReceipt} id={toastWithdrawId} />,
        })

        return
      }

      const id = toast({
        render: () => <Toast title={'Processing transaction...'} id={id} />,
      })
      const transferReceipt = await transferErc20(
        token.address as Address,
        receiver as Address,
        amountBI
      )

      if (!transferReceipt) {
        log.error(`Transfer ${token?.symbol} is unsuccessful`)
        return
      }
      setAmount('')
    },
  })

  /**
   * UI STATUS
   */
  const status: BalanceServiceStatus = useMemo(() => {
    if (isInvalidAmount) {
      return 'InvalidAmount'
    }
    return 'ReadyToFund'
  }, [isInvalidAmount])

  return (
    <BalanceService.Provider
      value={{
        overallBalanceUsd,
        amount,
        setAmount,
        unwrap,
        setUnwrap,
        withdrawMutation,
        setToken,
        token,
        status,
        ethBalance,
        wrapMutation,
        unwrapMutation,
        balanceLoading,
      }}
    >
      {children}
    </BalanceService.Provider>
  )
}

export const useBalanceQuery = () => {
  const toast = useToast()
  const log = new Logger(BalanceServiceProvider.name)
  const { marketTokensPrices } = usePriceOracle()

  const { account } = useAccount()

  const { supportedTokens } = useLimitlessApi()

  const {
    data: balanceOfSmartWallet,
    refetch,
    isLoading: balanceOfSmartWalletLoading,
  } = useQuery({
    queryKey: ['balance', account],
    queryFn: async () => {
      if (!account && !supportedTokens) {
        return
      }

      const multicall = new Multicall({
        ethersProvider: new ethers.providers.JsonRpcProvider(
          defaultChain.rpcUrls.default.http.toString()
        ),
        tryAggregate: true,
        multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
      })

      //@ts-ignore
      const contractCallContext: ContractCallContext[] = supportedTokens?.map((token) => ({
        reference: token.address,
        contractAddress: token.address,
        abi: token.priceOracleId === MarketTokensIds.WETH ? wethABI : erc20Abi,
        calls: [{ reference: 'balance', methodName: 'balanceOf', methodParameters: [account] }],
      }))
      let balanceResult: GetBalanceResult[]

      try {
        const results = await multicall.call(contractCallContext)

        const erc20Result = supportedTokens?.map((token) => {
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
        const ethBalance = await publicClient.getBalance({
          address: account as Address,
        })
        const ethBalanceResult = {
          symbol: 'ETH',
          id: 'ethereum',
          name: 'Ethereum',
          decimals: 18,
          value: ethBalance,
          formatted: formatUnits(ethBalance, 18),
          image: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628',
          contractAddress: '',
          price: marketTokensPrices ? marketTokensPrices['ethereum'].usd : 0,
        }
        //@ts-ignore
        balanceResult = erc20Result && ethBalanceResult ? [...erc20Result, ethBalanceResult] : []
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

      balanceResult.forEach((balance) => {
        if (!!balanceOfSmartWallet) {
          const currentBalance = balanceOfSmartWallet.find((currentBalanceEntity) => {
            return currentBalanceEntity.id === balance.id
          })
          if (currentBalance && balance.value > currentBalance.value && balance.symbol !== 'ETH') {
            const depositAmount = formatUnits(
              balance.value - currentBalance.value,
              currentBalance.decimals
            )

            const id = toast({
              render: () => (
                <Toast
                  title={`Balance top up: ${NumberUtil.toFixed(depositAmount, 6)} ${
                    balance.symbol
                  }`}
                  id={id}
                />
              ),
            })
          }
        }
      })

      return balanceResult
    },
    enabled: !!account && !!supportedTokens,
    refetchInterval: 10000,
  })
  const refetchbalanceOfSmartWallet = useCallback(() => refetch(), [])
  return useMemo(() => {
    return { balanceOfSmartWallet, refetchbalanceOfSmartWallet, balanceOfSmartWalletLoading }
  }, [balanceOfSmartWallet])
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
