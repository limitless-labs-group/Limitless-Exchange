import { Toast, ToastWithdraw } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { erc20ABI } from '@/contracts'
import { useToast } from '@/hooks'
import { publicClient } from '@/providers'
import { useEtherspot } from '@/services'
import { Address, GetBalanceResult } from '@/types'
import { Logger } from '@/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatUnits, getContract, isAddress, parseUnits } from 'viem'

interface IBalanceService {
  strategy: 'Deposit' | 'Withdraw'
  setStrategy: (actionType: 'Deposit' | 'Withdraw') => void
  // web3WalletBalance: FetchBalanceResult | undefined
  balanceOfSmartWallet: GetBalanceResult | undefined
  refetchbalanceOfSmartWallet: () => Promise<any>
  // balanceOfSmartWalletUsd: string | undefined
  amount: string | undefined
  setAmount: (amount: string | undefined) => void
  mint: () => void
  isLoadingMint: boolean
  // deposit: () => void
  addressToWithdraw: string | undefined
  setAddressToWithdraw: (amount: string | undefined) => void
  withdraw: () => Promise<any>
  status: BalanceServiceStatus
}

const BalanceService = createContext({} as IBalanceService)

export const useBalanceService = () => useContext(BalanceService)

export const BalanceServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * UI
   */
  const toast = useToast()
  const log = new Logger(BalanceServiceProvider.name)

  /**
   * OPTIONS
   */
  const [strategy, setStrategy] = useState<'Deposit' | 'Withdraw'>('Withdraw')

  /**
   * NETWORK
   */
  // const chainId = useChainId()

  /**
   * WALLETS
   */
  // const { isConnected } = useAccount()
  const { smartWalletAddress, transferErc20, whitelist, etherspot } = useEtherspot()

  const [addressToWithdraw, setAddressToWithdraw] = useState<string | undefined>()
  const isInvalidAddressToWithdraw = useMemo(
    () => !addressToWithdraw || !isAddress(addressToWithdraw),
    [addressToWithdraw]
  )

  /**
   * BALANCES
   */
  // const { data: web3WalletBalance } = useBalance({
  // address: web3WalletAddress,
  // refetchInterval: isConnected && 5000,
  // })

  const { data: balanceOfSmartWallet, refetch: refetchbalanceOfSmartWallet } = useQuery({
    queryKey: ['balance', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return
      }

      const erc20Contract = getContract({
        address: collateralToken.address[defaultChain.id],
        abi: erc20ABI,
        client: publicClient,
      })
      const newBalance = (await erc20Contract.read.balanceOf([smartWalletAddress])) as bigint
      const balanceResult: GetBalanceResult = {
        symbol: collateralToken.symbol,
        decimals: collateralToken.decimals,
        value: newBalance,
        formatted: formatUnits(newBalance, collateralToken.decimals),
      }

      log.success('ON_BALANCE_SUCC', smartWalletAddress, balanceResult)

      // TODO: refactor deposit handler
      if (!!balanceOfSmartWallet && newBalance > balanceOfSmartWallet?.value) {
        whitelist() // TODO: refactor the logic of whitelisting
        const depositAmount = Number(
          formatUnits(newBalance - balanceOfSmartWallet.value, collateralToken.decimals)
        ).toFixed(2)
        toast({
          render: () => <Toast title={`Balance top up: $${depositAmount}`} />,
        })
      }

      return balanceResult
    },
    enabled: !!smartWalletAddress,
    refetchInterval: 5000,
  })

  // const { data: balanceOfSmartWalletUsd } = useQuery(
  //   ['smart-wallet-balance-usd', balanceOfSmartWallet],
  //   {
  //     queryFn: async () => {
  //       if (!balanceOfSmartWallet || balanceOfSmartWallet.value <= 0) {
  //         return '0.0'
  //       }
  //       const ethPriceUsd = await Coingecko.ethPriceUsd()
  //       const balanceUsd = (Number(balanceOfSmartWallet.formatted) * ethPriceUsd).toFixed(1)
  //       return balanceUsd
  //     },
  //     onSuccess: (newBalanceUsd) => {
  //       if (!!balanceOfSmartWalletUsd && Number(newBalanceUsd) > Number(balanceOfSmartWalletUsd)) {
  //         toast({
  //           render: () => (
  //             <Toast title='Deposit is successfull!' text={`Your balance: ${newBalanceUsd} USD`} />
  //           ),
  //         })
  //       }
  //     },
  //   }
  // )

  /**
   * AMOUNT
   */
  const [amount, setAmount] = useState<string | undefined>()
  const formattedAmount = useMemo(
    () => parseUnits(amount ?? '0', collateralToken.decimals),
    [amount, collateralToken]
  )

  const isInvalidAmount = useMemo(() => {
    if (strategy == 'Deposit') {
      //   const isInvalidBalance = web3WalletBalance === undefined
      //   const isNegativeOrZeroAmount = formattedAmount <= 0n
      //   const isExceedsBalance = web3WalletBalance && formattedAmount > web3WalletBalance.value
      //   return isInvalidBalance || isNegativeOrZeroAmount || isExceedsBalance
      return false
    }
    if (strategy == 'Withdraw') {
      const isInvalidBalance = balanceOfSmartWallet === undefined
      const isNegativeOrZeroAmount = formattedAmount <= 0n
      const isExceedsBalance = balanceOfSmartWallet && formattedAmount > balanceOfSmartWallet.value
      return isInvalidBalance || isNegativeOrZeroAmount || isExceedsBalance
    }
  }, [
    // web3WalletBalance,
    strategy,
    balanceOfSmartWallet,
    formattedAmount,
  ])

  /**
   * DEPOSIT
   * transfer tokens from web3 wallet to smart wallet
   */
  const { mutate: mint, isPending: isLoadingMint } = useMutation({
    mutationFn: async () => {
      if (!smartWalletAddress) {
        return
      }
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })
      await etherspot?.mintErc20(
        collateralToken.address[defaultChain.id],
        smartWalletAddress,
        parseUnits('1000', collateralToken.decimals)
      )
      toast({
        render: () => <Toast title={'Confirmed. Updating balance...'} />,
      })
      await refetchbalanceOfSmartWallet()
    },
  })

  // const {
  //   mutate: deposit,
  //   isLoading: isLoadingDeposit,
  //   data: { tx: depositTx },
  // } = useDeposit({
  //   address: smartWalletAddress,
  //   amount: formattedAmount,
  //   onSign: (tx) => {
  //     toast({
  //       render: () => <Toast title={'Processing transaction...'} />,
  //     })
  //   },
  //   onConfirm: async (receipt) => {
  //     toast({
  //       render: () => <ToastDeposit receipt={receipt} />,
  //     })
  //     setAmount(undefined)
  //     await refetchbalanceOfSmartWallet()
  //   },
  // })

  /**
   * WITHDRAW
   * smart wallet -> web3 wallet
   */
  const {
    mutateAsync: withdraw,
    isPending: isLoadingWithdraw,
    data: withdrawTx,
  } = useMutation({
    mutationFn: async () => {
      return await transferErc20({
        token: collateralToken.address[defaultChain.id],
        to: addressToWithdraw as Address,
        amount: formattedAmount,
        onSign: () => {
          toast({
            render: () => <Toast title={'Processing transaction...'} />,
          })
        },
        onConfirm: async (receipt) => {
          setAmount(undefined)
          await refetchbalanceOfSmartWallet()
          toast({
            render: () => <ToastWithdraw receipt={receipt} />,
          })
        },
      })
    },
  })

  /**
   * UI STATUS
   */
  const status: BalanceServiceStatus = useMemo(() => {
    // if (!isConnected) {
    //   return 'WalletNotConnected'
    // }
    // if (chainId !== defaultChain.id) {
    //   return 'WrongNetwork'
    // }
    if (strategy === 'Withdraw' && isInvalidAddressToWithdraw) {
      return 'InvalidAddress'
    }
    if (isInvalidAmount) {
      return 'InvalidAmount'
    }
    if (
      // isLoadingDeposit ||
      isLoadingMint ||
      isLoadingWithdraw
    ) {
      return 'Loading'
    }
    // if (isExceedsAllowance) {
    //   return DepositUIState.'ExceedsAllowance'
    // }
    // if (depositTx || withdrawTx) {
    //   return FundingUIState.'FundingSubmitted'
    // }
    return 'ReadyToFund'
  }, [
    // isConnected,
    // chainId,
    strategy,
    isInvalidAddressToWithdraw,
    isInvalidAmount,
    // isLoadingDeposit,
    isLoadingMint,
    isLoadingWithdraw,
    // depositTx,
    withdrawTx,
  ])
  useEffect(() => {
    console.log(status)
  }, [status])

  const contextProviderValue: IBalanceService = {
    strategy,
    setStrategy,
    // web3WalletBalance,
    balanceOfSmartWallet,
    refetchbalanceOfSmartWallet,
    // balanceOfSmartWalletUsd,
    amount,
    setAmount,
    mint,
    isLoadingMint,
    // deposit,
    addressToWithdraw,
    setAddressToWithdraw,
    withdraw,
    status,
  }

  return <BalanceService.Provider value={contextProviderValue}>{children}</BalanceService.Provider>
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
