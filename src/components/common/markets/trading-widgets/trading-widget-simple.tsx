import { Box, Button, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import Paper from '@/components/common/paper'
import { LoadingForm, SellForm } from '@/app/(markets)/markets/[address]/components'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import {
  ChangeEvent,
  StrategyChangedMetadata,
  useAmplitude,
  usePosition,
  useTradingService,
} from '@/services'
import { controlsMedium, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface TradingWidgetSimpleProps {
  fullSizePage?: boolean
}

export default function TradingWidgetSimple({ fullSizePage = false }: TradingWidgetSimpleProps) {
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  const { strategy, setStrategy, market, marketGroup, setMarket, status } = useTradingService()
  const { trackChanged } = useAmplitude()
  const { data: allMarketsPositions } = usePosition()
  const { isOpen: isOpenSelectMarketMenu, onToggle: onToggleSelectMarketMenu } = useDisclosure()

  const positions = useMemo(
    () => allMarketsPositions?.filter((position) => position.market.slug === market?.slug),
    [allMarketsPositions, market]
  )

  return (
    <Paper
      bg={'var(--chakra-colors-grey-100)'}
      borderRadius='8px'
      overflowX='hidden'
      p='8px'
      position='relative'
      w={fullSizePage ? { base: '350px', xl: '400px', xxl: '442px' } : {}}
    >
      <HStack
        w={'240px'}
        mx='auto'
        bg='grey.200'
        borderRadius='8px'
        py='2px'
        px={'2px'}
        mb={isMobile ? '16px' : '24px'}
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
              marketMarketType: 'AMM',
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
              marketMarketType: 'AMM',
            })
            setStrategy('Sell')
          }}
          isDisabled={!positions?.length}
        >
          <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
            Sell
          </Text>
        </Button>
      </HStack>
      {marketGroup?.markets.length && (
        <>
          <Box mx={isMobile ? '16px' : 0}>
            <Button
              variant='transparentLight'
              w='full'
              justifyContent='space-between'
              mb={isOpenSelectMarketMenu ? '8px' : isMobile ? '24px' : '32px'}
              onClick={onToggleSelectMarketMenu}
              rightIcon={
                <Box
                  transform={`rotate(${isOpenSelectMarketMenu ? '180deg' : 0})`}
                  transition='0.5s'
                  color='white'
                >
                  <ChevronDownIcon width='16px' height='16px' />
                </Box>
              }
            >
              <HStack gap='8px' color='white'>
                <PredictionsIcon />
                <Text {...paragraphMedium} color='white'>
                  {market?.title}
                </Text>
              </HStack>
            </Button>
          </Box>
          {isOpenSelectMarketMenu && (
            <VStack
              gap={isMobile ? '16px' : '8px'}
              mb={isMobile ? '16px' : '8px'}
              mx={isMobile ? '16px' : 0}
            >
              {marketGroup?.markets.map((market) => (
                <Button
                  key={market.slug}
                  onClick={() => {
                    setMarket(market)
                    onToggleSelectMarketMenu()
                  }}
                  flexDirection='column'
                  variant='transparentLight'
                  w='full'
                >
                  <HStack mb='8px' w='full'>
                    <HStack justifyContent='space-between' w='full' alignItems='flex-start'>
                      <Text {...paragraphMedium} color='white'>
                        {market.title}
                      </Text>
                      <HStack gap='4px'>
                        <Text {...paragraphMedium} color='white'>
                          {market.prices[0]}%
                        </Text>
                        <Box
                          w='16px'
                          h='16px'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                        >
                          <Box
                            h='100%'
                            w='100%'
                            borderRadius='100%'
                            bg={`conic-gradient(white 0% ${
                              market.prices[0]
                            }%, var(--chakra-colors-transparent-300) ${
                              market.prices[0] < 1 ? 1 : market.prices[0]
                            }% 100%)`}
                          />
                        </Box>
                      </HStack>
                    </HStack>
                  </HStack>
                  <HStack
                    gap={isMobile ? '8px' : '16px'}
                    flexDirection={isMobile ? 'column' : 'row'}
                    w='full'
                  >
                    <HStack
                      w={isMobile ? '100%' : 'unset'}
                      justifyContent={isMobile ? 'space-between' : 'unset'}
                      color='white'
                    >
                      <LiquidityIcon width={16} height={16} />
                      <Text {...paragraphRegular} color='white'>
                        {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
                        {market.collateralToken.symbol}
                      </Text>
                    </HStack>
                    <HStack
                      w={isMobile ? '100%' : 'unset'}
                      justifyContent={isMobile ? 'space-between' : 'unset'}
                      color='white'
                    >
                      <VolumeIcon width={16} height={16} />
                      <Text {...paragraphRegular} color='white'>
                        {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
                        {market.collateralToken.symbol}
                      </Text>
                    </HStack>
                  </HStack>
                </Button>
              ))}
            </VStack>
          )}
        </>
      )}
      {strategy === 'Buy' && (
        <MarketPageBuyForm setOutcomeIndex={setOutcomeIndex} marketList={marketGroup?.markets} />
      )}
      {strategy === 'Sell' ? (
        status === 'Loading' ? (
          <LoadingForm outcomeIndex={outcomeIndex} />
        ) : (
          <SellForm setOutcomeIndex={setOutcomeIndex} />
        )
      ) : null}
    </Paper>
  )
}
