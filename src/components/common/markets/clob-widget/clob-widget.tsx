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
  VStack,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import ClobLimitTradeForm from '@/components/common/markets/clob-widget/clob-limit-trade-form'
import ClobMarketTradeForm from '@/components/common/markets/clob-widget/clob-market-trade-form'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import OutcomeButtonsClob from '@/components/common/markets/outcome-buttons/outcome-buttons-clob'
import SplitSharesModal from '@/components/common/modals/split-shares-modal'
import Paper from '@/components/common/paper'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import { useOrderBook } from '@/hooks/use-order-book'
import SettingsIcon from '@/resources/icons/setting-icon.svg'
import {
  ChangeEvent,
  StrategyChangedMetadata,
  useAccount,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useWeb3Service } from '@/services/Web3Service'
import { controlsMedium, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'

export default function ClobWidget() {
  const { trackChanged } = useAmplitude()
  const { strategy, setStrategy, market } = useTradingService()

  const privateClient = useAxiosPrivateClient()
  const { profileData, account } = useAccount()
  const queryClient = useQueryClient()
  const { approveContract, placeLimitOrder, placeMarketOrder, approveAllowanceForAll } =
    useWeb3Service()

  const {
    isBalanceNotEnough,
    orderType,
    setOrderType,
    outcome,
    setOutcome,
    price,
    setPrice,
    sharesAmount,
    setSharesAmount,
    allowance,
    isApprovedForSell,
    checkMarketAllowance,
  } = useClobWidget()
  // const { data: conditionalTokensAddress } = useConditionalTokensAddr({
  //   marketAddr: !market ? undefined : getAddress(market.address),
  // })
  const { data: orderBook } = useOrderBook(market?.slug)
  // const { data: ownedShares } = useClobMarketShares(account, [
  //   market?.tokens.yes as string,
  //   market?.tokens.no as string,
  // ])
  //
  // console.log(ownedShares)

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

  const handleOrderTypeChanged = (order: MarketOrderType) => {
    setOrderType(order)
    setSharesAmount('')
  }

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
    }
    return true
  }, [orderType, price])

  // const actionButton = useMemo(() => {
  //   if (strategy === 'Buy') {
  //     if (!!+sharesPrice && market) {
  //       const isApprovalNeeded = new BigNumber(allowance.toString()).isLessThan(
  //         parseUnits(sharesPrice, market.collateralToken.decimals).toString()
  //       )
  //       return (
  //         <ButtonWithStates
  //           status={approveMutation.status}
  //           variant='contained'
  //           w='full'
  //           mt='24px'
  //           onClick={isApprovalNeeded ? onApprove : onClickBuy}
  //           isDisabled={!+sharesPrice || !isSharePriceValid || isBalanceNotEnough}
  //           onReset={async () => {
  //             approveMutation.reset()
  //             await checkMarketAllowance()
  //           }}
  //         >
  //           {isApprovalNeeded ? 'Approve' : strategy}
  //         </ButtonWithStates>
  //       )
  //     }
  //   }
  //   if (!!+sharesPrice && market) {
  //     return (
  //       <ButtonWithStates
  //         status={approveForSellMutation.status}
  //         variant='contained'
  //         w='full'
  //         mt='24px'
  //         onClick={!isApprovedForSell ? onApproveSell : onClickBuy}
  //         isDisabled={!+sharesPrice || !isSharePriceValid}
  //         onReset={async () => {
  //           approveForSellMutation.reset()
  //           await checkMarketAllowance()
  //         }}
  //       >
  //         {!isApprovedForSell ? 'Approve Sell' : strategy}
  //       </ButtonWithStates>
  //     )
  //   }
  //
  //   return <Box mt='24px' />
  // }, [
  //   allowance,
  //   market,
  //   sharesPrice,
  //   strategy,
  //   approveMutation.status,
  //   isApprovedForSell,
  //   isSharePriceValid,
  // ])

  return (
    <>
      <HStack w='full' justifyContent='center'>
        <Button
          bg={orderType === MarketOrderType.MARKET ? 'grey.100' : 'unset'}
          h='32px'
          borderBottomRadius={0}
          onClick={() => handleOrderTypeChanged(MarketOrderType.MARKET)}
        >
          Market
        </Button>
        <Button
          onClick={() => handleOrderTypeChanged(MarketOrderType.LIMIT)}
          bg={orderType === MarketOrderType.LIMIT ? 'grey.100' : 'unset'}
          h='32px'
          borderBottomRadius={0}
        >
          Limit Order
        </Button>
      </HStack>
      <Paper bg='grey.100' borderRadius='8px' p='8px' position='relative'>
        <HStack w='full' justifyContent='center' mb='16px' pl='16px'>
          <HStack w={'236px'} mx='auto' bg='grey.200' borderRadius='8px' py='2px' px={'2px'}>
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
          <SettingsIcon width={16} height={16} />
        </HStack>
        <OutcomeButtonsClob outcome={outcome} setOutcome={setOutcome} />
        {orderType === MarketOrderType.MARKET ? <ClobMarketTradeForm /> : <ClobLimitTradeForm />}
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
        {isBalanceNotEnough && (
          <Text my='8px' color='red.500'>
            Not enough funds
          </Text>
        )}
        {/*<Menu isOpen={moreMenuOpened} onClose={onToggleMoreMenu} variant='outlined'>*/}
        {/*  <MenuButton w='full' onClick={onToggleMoreMenu} flex={1} mt='24px'>*/}
        {/*    <Text fontWeight={500}>More</Text>*/}
        {/*  </MenuButton>*/}
        {/*  <MenuList*/}
        {/*    borderRadius='8px'*/}
        {/*    w={isMobile ? 'calc(100vw - 32px)' : '200px'}*/}
        {/*    maxH={isMobile ? 'unset' : '104px'}*/}
        {/*    overflowY={isMobile ? 'unset' : 'auto'}*/}
        {/*  >*/}
        {/*    <MenuItem onClick={onToggleSplitSharesModal}>*/}
        {/*      <HStack gap='4px'>*/}
        {/*        <Text fontWeight={500}>Split shares</Text>*/}
        {/*      </HStack>*/}
        {/*    </MenuItem>*/}
        {/*  </MenuList>*/}
        {/*</Menu>*/}
      </Paper>
      {/*<SplitSharesModal isOpen={splitSharesModalOpened} onClose={onToggleSplitSharesModal} />*/}
    </>
  )
}
