import { Box, HStack, Tab, TabIndicator, TabList, Tabs, Text } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import ClobLimitTradeForm from '@/components/common/markets/clob-widget/clob-limit-trade-form'
import ClobMarketTradeForm from '@/components/common/markets/clob-widget/clob-market-trade-form'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import OrderTypeSelectMenu from '@/components/common/markets/clob-widget/order-type-select-menu'
import SharesActionsClob from '@/components/common/markets/clob-widget/shares-actions-clob'
import TradeStepperMenu from '@/components/common/markets/clob-widget/trade-stepper-menu'
import OutcomeButtonsClob from '@/components/common/markets/outcome-buttons/outcome-buttons-clob'
import { Overlay } from '@/components/common/overlay'
import Paper from '@/components/common/paper'
import { blockTradeAtom } from '@/atoms/trading'
import { ChangeEvent, StrategyChangedMetadata, useAmplitude, useTradingService } from '@/services'
import { PendingTradeData } from '@/services/PendingTradeService'
import { headLineLarge, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'

export default function ClobWidget() {
  const { trackChanged } = useAmplitude()
  const {
    setStrategy,
    market,
    groupMarket,
    strategy,
    setClobOutcome: setOutcome,
  } = useTradingService()

  const {
    isBalanceNotEnough,
    orderType,
    setOrderType,
    tradeStepperOpen,
    onToggleTradeStepper,
    setPrice,
  } = useClobWidget()
  const [tradingBlocked, setTradingBlocked] = useAtom(blockTradeAtom)

  const handlePendingTradeData = () => {
    const pendingTradeData = localStorage.getItem('pendingTrade')

    if (!pendingTradeData) return

    try {
      const parsedData: PendingTradeData = JSON.parse(pendingTradeData)
      const { price, strategy, outcome, orderType, marketSlug } = parsedData

      if (marketSlug === market?.slug) {
        setPrice(price)
        setOrderType(orderType)
        setOutcome(outcome)
        setStrategy(strategy)
        localStorage.removeItem('pendingTrade')
      }
    } catch (error) {
      console.error('Error processing pending trade data:', error)
      localStorage.removeItem('pendingTrade')
    }
  }

  useEffect(() => {
    handlePendingTradeData()
  }, [market?.slug, setPrice, setOrderType, setOutcome, setStrategy])

  const tabs = [
    {
      title: 'Buy',
    },
    {
      title: 'Sell',
    },
  ]

  const handleTabChanged = (tab: 'Buy' | 'Sell') => {
    trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
      type: `${tab} selected`,
      marketAddress: market?.slug as Address,
      marketMarketType: 'CLOB',
    })
    setStrategy(tab)
  }

  useEffect(() => {
    setStrategy(strategy)
    setTradingBlocked(false)
  }, [strategy])

  return (
    <Box>
      <Box position='relative' borderRadius='8px' overflow='hidden'>
        <Overlay show={tradeStepperOpen} onClose={onToggleTradeStepper} />
        {tradeStepperOpen && <TradeStepperMenu />}
        <Paper bg='grey.100' borderRadius='8px' p='8px' position='relative'>
          {groupMarket && (
            <>
              <Text {...headLineLarge} mb='8px'>
                {market?.proxyTitle || market?.title}
              </Text>
              <Text {...paragraphRegular} color='grey.500' mb='24px'>
                {groupMarket.proxyTitle || groupMarket.title}
              </Text>
            </>
          )}
          <HStack
            w='full'
            justifyContent='space-between'
            gap={0}
            mb='24px'
            borderBottom='1px solid'
            borderColor='grey.500'
          >
            <Tabs
              position='relative'
              variant='common'
              minW={isMobile ? '104px' : '120px'}
              index={strategy === 'Buy' ? 0 : 1}
            >
              <TabList>
                {tabs.map((tab) => (
                  <Tab
                    key={tab.title}
                    onClick={() => handleTabChanged(tab.title as 'Buy' | 'Sell')}
                    minW='52px'
                  >
                    <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                      <>{tab.title}</>
                    </HStack>
                  </Tab>
                ))}
              </TabList>
              <TabIndicator
                mt='-1px'
                height='2px'
                bg='grey.800'
                transitionDuration='200ms !important'
              />
            </Tabs>
            <HStack w='full' justifyContent='flex-end' paddingBottom={isMobile ? '8px' : 0}>
              <OrderTypeSelectMenu />
            </HStack>
          </HStack>
          <OutcomeButtonsClob />
          {orderType === MarketOrderType.MARKET ? <ClobMarketTradeForm /> : <ClobLimitTradeForm />}
          {isBalanceNotEnough && (
            <Text my='8px' {...paragraphRegular} color='grey.500' textAlign={'center'}>
              Not enough funds
            </Text>
          )}
        </Paper>
      </Box>

      <SharesActionsClob />
    </Box>
  )
}
