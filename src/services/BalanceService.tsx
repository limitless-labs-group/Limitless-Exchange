import { Toast, ToastWithdraw } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { wethABI } from '@/contracts'
import { useToast } from '@/hooks'
import { publicClient } from '@/providers'
import { useEtherspot } from '@/services'
import { Address, GetBalanceResult } from '@/types'
import { Logger, NumberUtil } from '@/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import {
  TransactionReceipt,
  formatEther,
  formatUnits,
  getContract,
  isAddress,
  parseEther,
  parseUnits,
} from 'viem'
import { getBalance } from 'viem/actions'

interface IBalanceService {
  balanceOfSmartWallet: GetBalanceResult | undefined
  refetchbalanceOfSmartWallet: () => Promise<any>

  mint: () => void
  isLoadingMint: boolean

  addressToWithdraw: string
  setAddressToWithdraw: (amount: string) => void
  amount: string
  setAmount: (amount: string) => void
  unwrap: boolean
  setUnwrap: (unwrap: boolean) => void
  withdraw: () => Promise<any>

  status: BalanceServiceStatus
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

  /**
   * Etherspot
   */
  const { smartWalletAddress, transferErc20, whitelist, etherspot } = useEtherspot()

  /**
   * Weth balance
   */
  const { data: balanceOfSmartWallet, refetch: refetchbalanceOfSmartWallet } = useQuery({
    queryKey: ['balance', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return
      }

      const wethContract = getContract({
        address: collateralToken.address[defaultChain.id],
        abi: wethABI,
        client: publicClient,
      })
      const newBalance = (await wethContract.read.balanceOf([smartWalletAddress])) as bigint
      const balanceResult: GetBalanceResult = {
        symbol: collateralToken.symbol,
        decimals: collateralToken.decimals,
        value: newBalance,
        formatted: formatUnits(newBalance, collateralToken.decimals),
      }

      log.success('ON_BALANCE_SUCC', smartWalletAddress, balanceResult)

      // TODO: refactor deposit handler
      if (!!balanceOfSmartWallet && newBalance > balanceOfSmartWallet?.value) {
        if (!defaultChain.testnet) {
          whitelist() // TODO: refactor the logic of whitelisting
        }

        const depositAmount = NumberUtil.toFixed(
          formatUnits(newBalance - balanceOfSmartWallet.value, collateralToken.decimals),
          4
        )

        toast({
          render: () => (
            <Toast title={`Balance top up: ${depositAmount} ${collateralToken.symbol}`} />
          ),
        })
      }

      return balanceResult
    },
    enabled: !!smartWalletAddress,
    refetchInterval: 5000,
  })

  /**
   * Auto-wrap/unwrap Eth
   */
  const [unwrap, setUnwrap] = useState(false) // unwrap on withdrawal

  useQuery({
    queryKey: ['autoWrapEth', smartWalletAddress, unwrap],
    queryFn: async () => {
      if (!smartWalletAddress || !etherspot || unwrap) {
        return
      }
      const eth = await getBalance(publicClient, { address: smartWalletAddress })
      const ethFormatted = formatEther(eth)
      const gasFee = defaultChain.testnet ? 0.005 : 0 // there's no paymaster on testnet so it's required to left some eth for gas
      log.info('ETH balance:', ethFormatted)
      if (Number(ethFormatted) > gasFee) {
        toast({
          render: () => <Toast title={'Wrapping ETH...'} />,
        })
        const receipt = await etherspot.wrapEth(eth - parseEther(gasFee.toString()))
        if (!receipt) {
          // TODO: show toast?
          log.error('autoWrapEth')
        } else {
          log.success('autoWrapEth', receipt)
        }
      }
    },
    enabled: !!smartWalletAddress && !!etherspot && !unwrap,
    refetchInterval: pathname.includes('wallet') && 5000, // polling on wallet page only
  })

  /**
   * Mint mocked erc20
   */
  const { mutate: mint, isPending: isLoadingMint } = useMutation({
    mutationFn: async () => {
      if (!etherspot) {
        return
      }
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })
      await etherspot.mintErc20(
        collateralToken.address[defaultChain.id],
        parseUnits('1', collateralToken.decimals)
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
  const amountBI = useMemo(
    () => parseUnits(amount ?? '0', collateralToken.decimals),
    [amount, collateralToken]
  )
  const isInvalidAmount = useMemo(() => {
    const isInvalidBalance = balanceOfSmartWallet === undefined
    const isNegativeOrZeroAmount = amountBI <= 0n
    const isExceedsBalance = !!balanceOfSmartWallet && amountBI > balanceOfSmartWallet.value
    return isInvalidBalance || isNegativeOrZeroAmount || isExceedsBalance
  }, [balanceOfSmartWallet, amountBI])

  // Mutation
  const { mutateAsync: withdraw, isPending: isLoadingWithdraw } = useMutation({
    mutationFn: async () => {
      if (unwrap) {
        toast({
          render: () => <Toast title={'Unwrapping ETH...'} />,
        })
        const unwrapReceipt = await etherspot?.unwrapEth(amountBI)
        if (!unwrapReceipt) {
          // TODO: show error toast
          log.error('Unwrap is unsuccessful')
          return
        }
        const transferReceipt = (await etherspot?.transferEthers(
          addressToWithdraw as Address,
          amountBI,
          true
        )) as TransactionReceipt | undefined
        if (!transferReceipt) {
          // TODO: show error toast
          log.error('Transfer ETH is unsuccessful')
          return
        }
        setUnwrap(false)
        toast({
          render: () => <ToastWithdraw receipt={transferReceipt} />,
        })
        return
      }
      await transferErc20({
        token: collateralToken.address[defaultChain.id],
        to: addressToWithdraw as Address,
        amount: amountBI,
        onSign: () => {
          toast({
            render: () => <Toast title={'Processing transaction...'} />,
          })
        },
        onConfirm: async (receipt) => {
          setAmount('')
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
    if (isInvalidAddressToWithdraw) {
      return 'InvalidAddress'
    }
    if (isInvalidAmount) {
      return 'InvalidAmount'
    }
    if (isLoadingMint || isLoadingWithdraw) {
      return 'Loading'
    }
    return 'ReadyToFund'
  }, [isInvalidAddressToWithdraw, isInvalidAmount, isLoadingMint, isLoadingWithdraw])

  return (
    <BalanceService.Provider
      value={{
        balanceOfSmartWallet,
        refetchbalanceOfSmartWallet,

        mint,
        isLoadingMint,

        addressToWithdraw,
        setAddressToWithdraw,
        amount,
        setAmount,
        unwrap,
        setUnwrap,
        withdraw,

        status,
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
