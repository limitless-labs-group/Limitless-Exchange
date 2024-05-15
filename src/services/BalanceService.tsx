import { Toast, ToastWithdraw } from '@/components'
import {
  collateralToken,
  defaultChain,
  degen,
  higher,
  mfer,
  onChain,
  regen,
  weth,
} from '@/constants'
import { wethABI } from '@/contracts'
import { useToast } from '@/hooks'
import { publicClient, usePriceOracle } from '@/providers'
import { useEtherspot } from '@/services'
import { Address, GetBalanceResult, MarketTokensIds } from '@/types'
import { Logger, NumberUtil } from '@/utils'
import {
  QueryObserverResult,
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'
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
  const { ethPrice, marketTokensPrices, convertAssetAmountToUsd } = usePriceOracle()

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

      const degenContract = getContract({
        address: degen.address[defaultChain.id],
        abi: wethABI,
        client: publicClient,
      })

      const regenContract = getContract({
        address: regen.address[defaultChain.id],
        abi: wethABI,
        client: publicClient,
      })

      const higherContract = getContract({
        address: higher.address[defaultChain.id],
        abi: wethABI,
        client: publicClient,
      })

      const mferContract = getContract({
        address: mfer.address[defaultChain.id],
        abi: wethABI,
        client: publicClient,
      })

      const onChainContract = getContract({
        address: onChain.address[defaultChain.id],
        abi: wethABI,
        client: publicClient,
      })

      let newBalanceBIWeth = (await wethContract.read.balanceOf([smartWalletAddress])) as bigint
      // small balance to zero
      if (newBalanceBIWeth < parseEther('0.000001')) {
        newBalanceBIWeth = 0n
      }

      let newBalanceBIDegen = (await degenContract.read.balanceOf([smartWalletAddress])) as bigint

      if (newBalanceBIDegen < parseEther('0.000001')) {
        newBalanceBIDegen = 0n
      }

      let newBalanceBIRegen = (await regenContract.read.balanceOf([smartWalletAddress])) as bigint

      if (newBalanceBIRegen < parseEther('0.000001')) {
        newBalanceBIRegen = 0n
      }

      let newBalanceBIHigher = (await higherContract.read.balanceOf([smartWalletAddress])) as bigint

      if (newBalanceBIHigher < parseEther('0.000001')) {
        newBalanceBIHigher = 0n
      }

      let newBalanceBIMfer = (await mferContract.read.balanceOf([smartWalletAddress])) as bigint

      if (newBalanceBIMfer < parseEther('0.000001')) {
        newBalanceBIMfer = 0n
      }

      let newBalanceBIOnChain = (await onChainContract.read.balanceOf([
        smartWalletAddress,
      ])) as bigint

      if (newBalanceBIOnChain < parseEther('0.000001')) {
        newBalanceBIOnChain = 0n
      }

      const balanceResult: GetBalanceResult[] = [
        {
          symbol: weth.symbol,
          id: MarketTokensIds.ETH,
          name: weth.name,
          decimals: weth.decimals,
          value: newBalanceBIWeth,
          formatted: formatUnits(newBalanceBIWeth, weth.decimals),
          image: weth.imageURI,
          contractAddress: weth.address[defaultChain.id],
          price: ethPrice || 0,
        },
        {
          symbol: degen.symbol,
          id: MarketTokensIds.DEGEN,
          name: degen.name,
          decimals: degen.decimals,
          value: newBalanceBIDegen,
          formatted: formatUnits(newBalanceBIDegen, degen.decimals),
          image: degen.imageURI,
          contractAddress: degen.address[defaultChain.id],
          price: marketTokensPrices ? marketTokensPrices['degen-base'].usd : 0,
        },
        {
          symbol: regen.symbol,
          id: MarketTokensIds.REGEN,
          name: regen.name,
          decimals: regen.decimals,
          value: newBalanceBIRegen,
          formatted: formatUnits(newBalanceBIRegen, regen.decimals),
          image: regen.imageURI,
          contractAddress: regen.address[defaultChain.id],
          price: marketTokensPrices ? marketTokensPrices['regen'].usd : 0,
        },
        {
          symbol: higher.symbol,
          id: MarketTokensIds.HIGHER,
          name: higher.name,
          decimals: higher.decimals,
          value: newBalanceBIHigher,
          formatted: formatUnits(newBalanceBIHigher, higher.decimals),
          image: higher.imageURI,
          contractAddress: higher.address[defaultChain.id],
          price: marketTokensPrices ? marketTokensPrices['higher'].usd : 0,
        },
        {
          symbol: mfer.symbol,
          id: MarketTokensIds.MFER,
          name: mfer.name,
          decimals: mfer.decimals,
          value: newBalanceBIMfer,
          formatted: formatUnits(newBalanceBIMfer, mfer.decimals),
          image: mfer.imageURI,
          contractAddress: mfer.address[defaultChain.id],
          price: marketTokensPrices ? marketTokensPrices['mfercoin'].usd : 0,
        },
        {
          symbol: onChain.symbol,
          id: MarketTokensIds.ONCHAIN,
          name: onChain.name,
          decimals: onChain.decimals,
          value: newBalanceBIOnChain,
          formatted: formatUnits(newBalanceBIOnChain, onChain.decimals),
          image: onChain.imageURI,
          contractAddress: onChain.address[defaultChain.id],
          price: marketTokensPrices ? marketTokensPrices['onchain'].usd : 0,
        },
      ]

      log.success('ON_BALANCE_SUCC', smartWalletAddress, balanceResult)

      // TODO: refactor deposit handler and adjust for multiply tokens
      if (!!balanceOfSmartWallet && newBalanceBIWeth > balanceOfSmartWallet[0]?.value) {
        if (!defaultChain.testnet) {
          whitelist() // TODO: refactor the logic of whitelisting
        }

        const depositAmount = formatUnits(
          newBalanceBIWeth - balanceOfSmartWallet[0].value,
          collateralToken.decimals
        )

        toast({
          render: () => (
            <Toast
              title={`Balance top up: ${NumberUtil.toFixed(depositAmount, 6)} ${
                collateralToken.symbol
              }`}
            />
          ),
        })
      }

      return balanceResult
    },
    enabled: !!smartWalletAddress,
    refetchInterval: 5000,
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
    queryKey: ['autoWrapEth', smartWalletAddress, unwrap],
    queryFn: async () => {
      if (!smartWalletAddress || !etherspot || unwrap) {
        return
      }

      const eth = await getBalance(publicClient, { address: smartWalletAddress })
      const ethFormatted = formatEther(eth)
      log.info('ETH balance:', ethFormatted)

      const gasFee = defaultChain.testnet ? 0.005 : 0 // there's no paymaster on testnet so it's required to left some eth for gas

      if (Number(ethFormatted) > gasFee) {
        if (!defaultChain.testnet) {
          await whitelist() // TODO: refactor the logic of whitelisting
        }

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
    mutationFn: async (params: { address: Address; newToken?: boolean }) => {
      if (!etherspot) {
        return
      }
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      })
      await etherspot.mintErc20(
        params.address,
        parseUnits('1', collateralToken.decimals),
        smartWalletAddress || '0x',
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
  const amountBI = useMemo(() => parseUnits(amount ?? '0', collateralToken.decimals), [amount])
  const isInvalidAmount = useMemo(() => {
    const isInvalidBalance = balanceOfSmartWallet === undefined
    const isNegativeOrZeroAmount = amountBI <= 0n
    const isExceedsBalance = !!balanceOfSmartWallet && amountBI > balanceOfSmartWallet[0].value
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

        await refetchbalanceOfSmartWallet()

        toast({
          render: () => <Toast title={'Sending ETH...'} />,
        })

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

        setAmount('')
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
