import { Toast, ToastWithdraw } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { wethABI } from '@/contracts'
import { useToast } from '@/hooks'
import { publicClient } from '@/providers'
import { useEtherspot } from '@/services'
import { Address, GetBalanceResult } from '@/types'
import { Logger, NumberUtil } from '@/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatEther, formatUnits, getContract, isAddress, parseEther, parseUnits } from 'viem'
import { getBalance } from 'viem/actions'

interface IBalanceService {
  balanceOfSmartWallet: GetBalanceResult | undefined
  refetchbalanceOfSmartWallet: () => Promise<any>
  amount: string
  setAmount: (amount: string) => void
  mint: () => void
  isLoadingMint: boolean
  addressToWithdraw: string
  setAddressToWithdraw: (amount: string) => void
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
   * Auto-wrap Eth
   */
  useQuery({
    queryKey: ['autoWrapEth', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress || !etherspot) {
        return
      }
      const eth = await getBalance(publicClient, { address: smartWalletAddress })
      const ethFormatted = formatEther(eth)
      const gasFee = defaultChain.testnet ? 0.001 : 0 // there's no paymaster on testnet so it's required to left some eth for gas
      log.info('ETH balance:', ethFormatted)
      if (Number(ethFormatted) > gasFee) {
        const receipt = await etherspot.wrapEth(eth - parseEther(gasFee.toString()))
        log.success('Auto-wrap eth', receipt)
      }
    },
    // enabled: false,
    refetchInterval: 5000,
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
  const {
    mutateAsync: withdraw,
    isPending: isLoadingWithdraw,
    data: withdrawTx,
  } = useMutation({
    mutationFn: async () => {
      return await transferErc20({
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
  }, [isInvalidAddressToWithdraw, isInvalidAmount, isLoadingMint, isLoadingWithdraw, withdrawTx])

  return (
    <BalanceService.Provider
      value={{
        balanceOfSmartWallet,
        refetchbalanceOfSmartWallet,
        amount,
        setAmount,
        mint,
        isLoadingMint,
        addressToWithdraw,
        setAddressToWithdraw,
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
