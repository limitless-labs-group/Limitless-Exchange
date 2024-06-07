import { Toast, ToastWithdraw } from '@/components'
import { collateralToken, collateralTokensArray, defaultChain, weth } from '@/constants'
import { wethABI } from '@/contracts'
import { useToast } from '@/hooks'
import { usePriceOracle } from '@/providers'
import { useEtherspot } from '@/services'
import { Address, GetBalanceResult, MarketTokensIds, Token } from '@/types'
import { Logger, NumberUtil } from '@/utils'
import {
  QueryObserverResult,
  UseMutateAsyncFunction,
  useMutation,
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

interface IBalanceService {
  balanceOfSmartWallet: GetBalanceResult[] | undefined
  refetchbalanceOfSmartWallet: () => Promise<
    QueryObserverResult<GetBalanceResult[] | undefined, Error>
  >
  overallBalanceUsd: string

  mint: (params: { address: Address; newToken?: boolean }) => void
  isLoadingMint: boolean

  addressToWithdraw: string
  setAddressToWithdraw: (amount: string) => void
  amount: string
  setAmount: (amount: string) => void
  unwrap: boolean
  setUnwrap: (unwrap: boolean) => void
  withdraw: UseMutateAsyncFunction<void, Error, void, unknown>

  status: BalanceServiceStatus
  setToken: Dispatch<SetStateAction<Token>>
  token: Token

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

  /**
   * Weth balance
   */
  const { data: balanceOfSmartWallet, refetch: refetchbalanceOfSmartWallet } = useQuery({
    queryKey: ['balance', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return
      }

      const balances = await Promise.allSettled(
        collateralTokensArray.map(async (token) => {
          const contract = getContract({
            address: token.address[defaultChain.id],
            abi: token.id === MarketTokensIds.WETH ? wethABI : erc20Abi,
            client: publicClient,
          })
          let newBalanceBI = (await contract.read.balanceOf([walletAddress])) as bigint
          // small balance to zero
          if (newBalanceBI < parseEther('0.000001')) {
            newBalanceBI = 0n
          }

          return {
            symbol: token.symbol,
            id: token.id,
            name: token.name,
            decimals: token.decimals,
            value: newBalanceBI,
            formatted: formatUnits(newBalanceBI, token.decimals),
            image: token.imageURI,
            contractAddress: token.address[defaultChain.id],
            price: marketTokensPrices ? marketTokensPrices[token.id].usd : 0,
          } as GetBalanceResult
        })
      )

      const balanceResult: GetBalanceResult[] = balances.map((balance) => {
        // @ts-ignore
        return balance.value
      })

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
              collateralToken.decimals
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
    enabled: !!walletAddress,
    refetchInterval: 5000,
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
    refetchInterval: pathname.includes('wallet') && 5000, // polling on wallet page only
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
      await mintErc20(
        params.address,
        parseUnits('1', collateralToken.decimals),
        walletAddress || '0x',
        params.newToken
      )
      toast({
        render: () => <Toast title={'Confirmed. Updating balance...'} />,
      })
      await refetchbalanceOfSmartWallet()
    },
  })

  /**
   * WITHDRAW
   */
  // Address to withdraw funds to
  const [addressToWithdraw, setAddressToWithdraw] = useState<string>('')
  const isInvalidAddressToWithdraw = useMemo(
    () => !addressToWithdraw || !isAddress(addressToWithdraw),
    [addressToWithdraw]
  )

  // Amount to be withdrawn
  const [amount, setAmount] = useState<string>('')
  const [token, setToken] = useState(weth)
  const amountBI = useMemo(() => parseUnits(amount ?? '0', collateralToken.decimals), [amount])
  const isInvalidAmount = useMemo(() => {
    const isInvalidBalance = balanceOfSmartWallet === undefined
    const isNegativeOrZeroAmount = amountBI <= 0n
    const balanceEntity = balanceOfSmartWallet?.find((balance) => {
      return balance.id === token.id
    }) as GetBalanceResult
    const isExceedsBalance = !!balanceOfSmartWallet && amountBI > balanceEntity.value
    return isInvalidBalance || isNegativeOrZeroAmount || isExceedsBalance
  }, [balanceOfSmartWallet, amountBI, token])

  // Mutation
  const { mutateAsync: withdraw, isPending: isLoadingWithdraw } = useMutation({
    mutationFn: async () => {
      if (unwrap) {
        toast({
          render: () => <Toast title={'Unwrapping ETH...'} />,
        })

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

        const transferReceipt = await transferEthers(addressToWithdraw as Address, amountBI)

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
        token.address[defaultChain.id],
        addressToWithdraw as Address,
        amountBI
      )

      if (!transferReceipt) {
        // TODO: show error toast
        log.error(`Transfer ${token.symbol} is unsuccessful`)
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
    if (isInvalidAddressToWithdraw) {
      return 'InvalidAddress'
    }
    if (isInvalidAmount) {
      return 'InvalidAmount'
    }
    return 'ReadyToFund'
  }, [isInvalidAddressToWithdraw, isInvalidAmount, isLoadingMint, isLoadingWithdraw])

  return (
    <BalanceService.Provider
      value={{
        balanceOfSmartWallet,
        refetchbalanceOfSmartWallet,
        overallBalanceUsd,
        mint,
        isLoadingMint,
        addressToWithdraw,
        setAddressToWithdraw,
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
