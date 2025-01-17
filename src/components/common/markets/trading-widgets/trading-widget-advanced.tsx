import {
  Box,
  Button,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import SplitSharesModal from '@/components/common/modals/split-shares-modal'
import Paper from '@/components/common/paper'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import useMarketLockedBalance from '@/hooks/use-market-locked-balance'
import { useOrderBook } from '@/hooks/use-order-book'
import {
  ChangeEvent,
  StrategyChangedMetadata,
  useAccount,
  useAmplitude,
  useBalanceQuery,
  useHistory,
  useTradingService,
} from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useWeb3Service } from '@/services/Web3Service'
import { controlsMedium, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'
import { uppercaseFirstLetter } from '@/utils/string'

export default function TradingWidgetAdvanced() {
  const { trackChanged } = useAmplitude()
  const { strategy, setStrategy, market } = useTradingService()
  const { data: lockedBalance } = useMarketLockedBalance(market?.slug)
  const { data: sharesOwned } = useClobMarketShares(market?.slug, market?.tokens)
  const privateClient = useAxiosPrivateClient()
  const { profileData, account } = useAccount()
  const queryClient = useQueryClient()
  const {
    checkAllowance,
    approveContract,
    placeLimitOrder,
    placeMarketOrder,
    approveAllowanceForAll,
    checkAllowanceForAll,
  } = useWeb3Service()

  console.log(sharesOwned)
  // const { data: conditionalTokensAddress } = useConditionalTokensAddr({
  //   marketAddr: !market ? undefined : getAddress(market.address),
  // })
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { data: orderBook } = useOrderBook(market?.slug)
  // const { data: ownedShares } = useClobMarketShares(account, [
  //   market?.tokens.yes as string,
  //   market?.tokens.no as string,
  // ])
  //
  // console.log(ownedShares)

  const [orderType, setOrderType] = useState<MarketOrderType>(MarketOrderType.MARKET)
  const [outcome, setOutcome] = useState(0)
  const [price, setPrice] = useState('')
  const [sharesAmount, setSharesAmount] = useState('')
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isApprovedForSell, setIsApprovedForSell] = useState(false)

  const { isOpen: isLimitMenuOpened, onToggle: onToggleLimitMenu } = useDisclosure()
  const { isOpen: moreMenuOpened, onToggle: onToggleMoreMenu } = useDisclosure()
  const { isOpen: splitSharesModalOpened, onToggle: onToggleSplitSharesModal } = useDisclosure()

  const sharesPrice = useMemo(() => {
    if (orderType === MarketOrderType.LIMIT) {
      if (price && sharesAmount) {
        return new BigNumber(price).dividedBy(100).multipliedBy(sharesAmount).toString()
      }
      return '0'
    }
    if (price) {
      return price.toString()
    }
    return '0'
  }, [orderType, price, sharesAmount])

  const { yesPrice, noPrice } = useMemo(() => {
    if (orderBook) {
      if (strategy === 'Buy') {
        const yesPrice = orderBook?.asks.sort((a, b) => a.price - b.price)[0]?.price * 100
        const noPrice = (1 - orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price) * 100
        return {
          yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
          noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
        }
      }
      const yesPrice = orderBook?.bids.sort((a, b) => b.price - a.price)[0]?.price * 100
      const noPrice = (1 - orderBook?.asks.sort((a, b) => b.price - a.price)[0]?.price) * 100
      return {
        yesPrice: isNaN(yesPrice) ? 0 : +yesPrice.toFixed(),
        noPrice: isNaN(noPrice) ? 0 : +noPrice.toFixed(),
      }
    }
    return {
      yesPrice: 0,
      noPrice: 0,
    }
  }, [strategy, orderBook])

  const balance = useMemo(() => {
    if (balanceOfSmartWallet) {
      return (
        balanceOfSmartWallet.find(
          (balanceItem) => balanceItem.contractAddress === market?.collateralToken.address
        )?.formatted || ''
      )
    }
    return ''
  }, [balanceOfSmartWallet, strategy, market])

  const isBalanceNotEnough = useMemo(() => {
    if (orderType === MarketOrderType.LIMIT) {
      const amount = new BigNumber(price || '0').dividedBy(100).multipliedBy(sharesAmount)
      console.log(amount.toString())
      const lockedBalanceFormatted = formatUnits(
        BigInt(lockedBalance),
        market?.collateralToken.decimals || 6
      )
      console.log(lockedBalanceFormatted)
      const balanceLeft = new BigNumber(balance).minus(lockedBalanceFormatted)
      console.log(balanceLeft.toString())
      return amount.isGreaterThan(balanceLeft)
    }
  }, [balance, lockedBalance, market?.collateralToken.decimals, orderType, price, sharesAmount])

  console.log(isBalanceNotEnough)

  const approveMutation = useMutation({
    mutationKey: ['approve', market?.address],
    mutationFn: async () => {
      if (market) {
        await approveContract(
          process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
          market.collateralToken.address,
          parseUnits(sharesPrice, market.collateralToken.decimals)
        )
      }
    },
    onSuccess: async () => {
      await checkMarketAllowance()
    },
  })

  const approveForSellMutation = useMutation({
    mutationKey: ['approve-nft', market?.address],
    mutationFn: async () => {
      if (market) {
        await approveAllowanceForAll(
          process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
          process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
        )
      }
    },
  })

  const placeMarketOrderMutation = useMutation({
    mutationKey: ['market-order', market?.address, price],
    mutationFn: async () => {
      if (market) {
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeMarketOrder(
          tokenId,
          market.collateralToken.decimals,
          outcome === 0 ? yesPrice.toString() : noPrice.toString(),
          side,
          price
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price:
              orderType === MarketOrderType.LIMIT
                ? new BigNumber(price).dividedBy(100).toNumber()
                : undefined,
            makerAmount:
              orderType === MarketOrderType.LIMIT
                ? +signedOrder.makerAmount
                : +parseUnits(price, market.collateralToken.decimals).toString(),
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'FOK',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onSuccess: async () =>
      queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      }),
  })

  const placeLimitOrderMutation = useMutation({
    mutationKey: ['limit-order', market?.address, price],
    mutationFn: async () => {
      if (market) {
        const tokenId = outcome === 1 ? market.tokens.no : market.tokens.yes
        const side = strategy === 'Buy' ? 0 : 1
        const signedOrder = await placeLimitOrder(
          tokenId,
          market.collateralToken.decimals,
          price,
          sharesAmount,
          side
        )
        const data = {
          order: {
            ...signedOrder,
            salt: +signedOrder.salt,
            price:
              orderType === MarketOrderType.LIMIT
                ? new BigNumber(price).dividedBy(100).toNumber()
                : undefined,
            makerAmount:
              orderType === MarketOrderType.LIMIT
                ? +signedOrder.makerAmount
                : +parseUnits(price, market.collateralToken.decimals).toString(),
            takerAmount: +signedOrder.takerAmount,
            nonce: +signedOrder.nonce,
            feeRateBps: +signedOrder.feeRateBps,
          },
          ownerId: profileData?.id,
          orderType: 'GTC',
          marketSlug: market.slug,
        }
        return privateClient.post('/orders', data)
      }
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      })
      await queryClient.refetchQueries({
        queryKey: ['locked-balance', market?.slug],
      })
    },
  })

  const checkMarketAllowance = async () => {
    const allowance = await checkAllowance(
      process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
      market?.collateralToken.address as Address
    )
    const isApprovedNFT = await checkAllowanceForAll(
      process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    setAllowance(allowance)
    setIsApprovedForSell(isApprovedNFT)
  }

  const onApprove = async () => {
    await approveMutation.mutateAsync()
  }

  const onApproveSell = async () => {
    await approveForSellMutation.mutateAsync()
  }

  const onClickBuy = async () => {
    return orderType === MarketOrderType.LIMIT
      ? await placeLimitOrderMutation.mutateAsync()
      : await placeMarketOrderMutation.mutateAsync()
  }

  const handleChangePrice = (value: string) => {
    if (orderType === MarketOrderType.LIMIT) {
      if (/^-?\d*$/.test(value)) {
        setPrice(value)
        return
      }
      return
    }
    if (market?.collateralToken?.symbol === 'USDC') {
      const decimals = value.split('.')[1]
      if (decimals && decimals.length > 1) {
        return
      }
      setPrice(value)
      return
    }
    setPrice(value)
  }

  const resetFormFields = () => {
    setPrice('')
    setSharesAmount('')
  }

  const priceTitle = useMemo(() => {
    if (orderType === MarketOrderType.MARKET) {
      return strategy === 'Buy' ? 'Amount' : 'Shares'
    }
    return 'Limit price'
  }, [strategy, orderType])

  const isSharePriceValid = useMemo(() => {
    if (!!price) {
      if (orderType === MarketOrderType.LIMIT) {
        return +price > 0 && +price < 100
      }
      return new BigNumber(price).isLessThan(new BigNumber(balance))
    }
    return true
  }, [orderType, price, balance])

  const actionButton = useMemo(() => {
    if (strategy === 'Buy') {
      if (!!+sharesPrice && market) {
        const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
          parseUnits(sharesPrice, market.collateralToken.decimals).toString()
        )
        return (
          <ButtonWithStates
            status={approveMutation.status}
            variant='contained'
            w='full'
            mt='24px'
            onClick={isApprovalNeeded ? onApprove : onClickBuy}
            isDisabled={!+sharesPrice || !isSharePriceValid || isBalanceNotEnough}
            onReset={async () => {
              approveMutation.reset()
              await checkMarketAllowance()
            }}
          >
            {isApprovalNeeded ? 'Approve' : strategy}
          </ButtonWithStates>
        )
      }
    }
    if (!!+sharesPrice && market) {
      return (
        <ButtonWithStates
          status={approveForSellMutation.status}
          variant='contained'
          w='full'
          mt='24px'
          onClick={!isApprovedForSell ? onApproveSell : onClickBuy}
          isDisabled={!+sharesPrice || !isSharePriceValid}
          onReset={async () => {
            approveForSellMutation.reset()
            await checkMarketAllowance()
          }}
        >
          {!isApprovedForSell ? 'Approve Sell' : strategy}
        </ButtonWithStates>
      )
    }

    return <Box mt='24px' />
  }, [
    allowance,
    market,
    sharesPrice,
    strategy,
    approveMutation.status,
    isApprovedForSell,
    isSharePriceValid,
  ])

  useEffect(() => {
    if (market && account) {
      checkMarketAllowance()
    }
  }, [market, account])

  return (
    <>
      <HStack w='full' justifyContent='center'>
        <Button>Market</Button>
        <Button>Limit Order</Button>
      </HStack>
      <Paper bg='grey.100' borderRadius='8px' p='8px' position='relative'>
        <HStack w='full' justifyContent='space-between' gap={12} mb='16px'>
          <HStack
            w={'240px'}
            mx='auto'
            bg='grey.200'
            borderRadius='8px'
            py='2px'
            px={'2px'}
            flex={1}
          >
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              py='2px'
              borderRadius='6px'
              bg={strategy === 'Buy' ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: strategy === 'Buy' ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              onClick={() => {
                trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                  type: 'Buy selected',
                  marketAddress: market?.address as Address,
                })
                setStrategy('Buy')
              }}
            >
              <Text {...controlsMedium} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
                Buy
              </Text>
            </Button>
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              borderRadius='6px'
              py='2px'
              bg={strategy === 'Sell' ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: strategy === 'Sell' ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              _disabled={{
                opacity: '50%',
                pointerEvents: 'none',
              }}
              onClick={() => {
                trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                  type: 'Sell selected',
                  marketAddress: market?.address as Address,
                })
                setStrategy('Sell')
              }}
            >
              <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
                Sell
              </Text>
            </Button>
          </HStack>
          <Menu isOpen={isLimitMenuOpened} onClose={onToggleLimitMenu} variant='outlined'>
            <MenuButton w='full' onClick={onToggleLimitMenu} flex={1}>
              <Text fontWeight={500}>{uppercaseFirstLetter(orderType)}</Text>
            </MenuButton>
            <MenuList
              borderRadius='8px'
              w={isMobile ? 'calc(100vw - 32px)' : '200px'}
              maxH={isMobile ? 'unset' : '104px'}
              overflowY={isMobile ? 'unset' : 'auto'}
            >
              {[MarketOrderType.LIMIT, MarketOrderType.MARKET].map((orderType) => (
                <MenuItem
                  onClick={() => {
                    setOrderType(orderType)
                    setSharesAmount('')
                  }}
                  key={orderType}
                >
                  <HStack gap='4px'>
                    <Text fontWeight={500}>{uppercaseFirstLetter(orderType)}</Text>
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
        <Divider mb='8px' bg='grey.300' borderColor='grey.300' />
        <HStack w='full' justifyContent='space-between'>
          <Text {...paragraphMedium} mb='12px'>
            Outcome
          </Text>
          <Text {...paragraphMedium} mb='12px'>
            Balance
          </Text>
        </HStack>
        <HStack w='full' justifyContent='space-between'>
          <HStack w={'240px'} bg='grey.200' borderRadius='8px' py='2px' px={'2px'}>
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              py='2px'
              borderRadius='6px'
              bg={outcome === 0 ? 'green.500' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: outcome === 0 ? 'green.500' : 'rgba(255, 255, 255, 0.10)',
              }}
              onClick={() => {
                // trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                //   type: 'Buy selected',
                //   marketAddress: market?.address as Address,
                // })
                setOutcome(0)
              }}
            >
              <Text {...controlsMedium} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
                Yes {yesPrice} %
              </Text>
            </Button>
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              borderRadius='6px'
              py='2px'
              bg={outcome === 1 ? 'red.500' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: outcome === 1 ? 'red.500' : 'rgba(255, 255, 255, 0.10)',
              }}
              _disabled={{
                opacity: '50%',
                pointerEvents: 'none',
              }}
              onClick={() => {
                // trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                //   type: 'Sell selected',
                //   marketAddress: market?.address as Address,
                // })
                setOutcome(1)
              }}
            >
              <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
                No {noPrice}%
              </Text>
            </Button>
          </HStack>
          <Text {...paragraphMedium}>
            {balance} {market?.collateralToken.symbol}
          </Text>
        </HStack>
        <Divider my='8px' />
        <HStack w='full' justifyContent='space-between' mb='8px'>
          <Text {...paragraphMedium}>{priceTitle}</Text>
          {!isSharePriceValid && (
            <Text {...paragraphMedium} color='red.500'>
              Invalid amount
            </Text>
          )}
        </HStack>
        <InputGroup>
          <InputLeftElement pointerEvents='none' w='24px' h='24px' pl='12px'>
            {orderType === MarketOrderType.LIMIT ? '¢' : '$'}
          </InputLeftElement>
          <Input
            variant='grey'
            placeholder='0'
            value={price}
            onChange={(e) => handleChangePrice(e.target.value)}
            onWheel={(e) => e.preventDefault()}
            pl='32px'
            isInvalid={!isSharePriceValid}
          />
        </InputGroup>
        <Divider my='8px' />
        {orderType === MarketOrderType.LIMIT && (
          <>
            <Text {...paragraphMedium} mb='8px'>
              Shares
            </Text>
            <InputGroup>
              <Input
                type='number'
                placeholder='0'
                value={sharesAmount}
                onChange={(e) => setSharesAmount(e.target.value)}
                onWheel={(e) => e.stopPropagation()}
                variant='grey'
              />
            </InputGroup>
          </>
        )}
        {actionButton}
        {isBalanceNotEnough && (
          <Text my='8px' color='red.500'>
            Not enough funds
          </Text>
        )}
        <Menu isOpen={moreMenuOpened} onClose={onToggleMoreMenu} variant='outlined'>
          <MenuButton w='full' onClick={onToggleMoreMenu} flex={1} mt='24px'>
            <Text fontWeight={500}>More</Text>
          </MenuButton>
          <MenuList
            borderRadius='8px'
            w={isMobile ? 'calc(100vw - 32px)' : '200px'}
            maxH={isMobile ? 'unset' : '104px'}
            overflowY={isMobile ? 'unset' : 'auto'}
          >
            <MenuItem onClick={onToggleSplitSharesModal}>
              <HStack gap='4px'>
                <Text fontWeight={500}>Split shares</Text>
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
      </Paper>
      <SplitSharesModal isOpen={splitSharesModalOpened} onClose={onToggleSplitSharesModal} />
    </>
  )
}
