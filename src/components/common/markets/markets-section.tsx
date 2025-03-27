import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import MarketCardMobile from '@/components/common/markets/market-cards/market-card-mobile'
import Skeleton from '@/components/common/skeleton'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market, Sort, SortStorageName } from '@/types'
import { getAnalyticsParams } from '@/utils/market'
import SortFilter from '../sort-filter'

interface DailyMarketsSectionProps {
  markets?: Market[]
  handleSelectSort: (option: Sort, name: SortStorageName) => void
  isLoading: boolean
  sort: Sort
}

export default function MarketsSection({
  markets,
  handleSelectSort,
  isLoading,
  sort,
}: DailyMarketsSectionProps) {
  const { selectedCategory } = useTokenFilter()
  const category = useMemo(() => {
    return selectedCategory ? { fromCategory: selectedCategory.name } : {}
  }, [selectedCategory])

  return (
    <Box
      mt='24px'
      mb={isMobile ? '36px' : '40px'}
      w={isMobile ? 'full' : '664px'}
      justifyContent='center'
    >
      <Box px={isMobile ? '16px' : 0}>
        <Divider orientation='horizontal' borderColor='grey.100' />
        <Flex
          alignItems='center'
          justifyContent='space-between'
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Text {...headlineRegular} mt={isMobile ? '8px' : '0px'}>
            All Markets
          </Text>
          <SortFilter onChange={handleSelectSort} sort={sort} />
        </Flex>
      </Box>
      {isMobile ? (
        <VStack gap={2} w='full' px='16px' mt='16px'>
          {isLoading
            ? [...Array(3)].map((_, index) => <Skeleton height={200} key={index} />)
            : markets?.map((market, index) => {
                const cyclePosition = index % 10
                // First 6 cards in cycle - regular cards
                if (cyclePosition < 6) {
                  return (
                    <MarketCardMobile
                      key={market.slug || market.address}
                      market={market}
                      analyticParams={getAnalyticsParams(index, 0, category)}
                      markets={markets}
                    />
                  )
                }
                // Next 4 cards in cycle - speedometer cards
                if (cyclePosition >= 6 && cyclePosition < 10) {
                  return (
                    <MarketCardMobile
                      key={market.slug || market.address}
                      market={market}
                      variant='speedometer'
                      analyticParams={getAnalyticsParams(index, 0, category)}
                      markets={markets}
                    />
                  )
                }
                return null
              })}
        </VStack>
      ) : (
        <Box mt='24px'>
          <VStack gap={4} w='full'>
            {!isLoading &&
              markets?.map((market, index) => {
                const cyclePosition = index % 12
                // First 2 cards - straight column
                if (cyclePosition < 2) {
                  return (
                    <Box key={market.slug || market.address} w='full'>
                      <MarketCard
                        market={market}
                        analyticParams={getAnalyticsParams(index, 0, category)}
                      />
                    </Box>
                  )
                }

                // Next 4 cards - 2x2 grid
                if (cyclePosition >= 2 && cyclePosition < 6) {
                  const isGridStart = cyclePosition === 2
                  if (isGridStart) {
                    const gridCards = markets.slice(index, index + 4)
                    return (
                      <Flex
                        key={`grid-${market.slug || market.address}`}
                        flexWrap='wrap'
                        gap={4}
                        w='full'
                      >
                        {gridCards.map((gridMarket, gridIndex) => (
                          <Box
                            key={gridMarket.slug || gridMarket.address}
                            flex='1 1 calc(50% - 8px)'
                            minW='calc(50% - 8px)'
                          >
                            <MarketCard
                              variant='grid'
                              market={gridMarket}
                              analyticParams={getAnalyticsParams(index, gridIndex, category)}
                            />
                          </Box>
                        ))}
                      </Flex>
                    )
                  }
                  return null
                }

                // Next 2 cards - straight column
                if (cyclePosition >= 6 && cyclePosition < 8) {
                  return (
                    <Box key={market.slug || market.address} w='full'>
                      <MarketCard
                        market={market}
                        analyticParams={getAnalyticsParams(index, 0, category)}
                      />
                    </Box>
                  )
                }

                // Last 4 cards - 2x2 speedometer
                if (cyclePosition >= 8 && cyclePosition < 12) {
                  const isSpeedometerStart = cyclePosition === 8
                  if (isSpeedometerStart) {
                    const speedometerCards = markets.slice(index, index + 4)

                    if (speedometerCards.length === 1) {
                      // Single market - show as row
                      return (
                        <Box key={speedometerCards[0].slug || speedometerCards[0].address} w='full'>
                          <MarketCard
                            variant='grid'
                            market={speedometerCards[0]}
                            analyticParams={getAnalyticsParams(index, 0, category)}
                          />
                        </Box>
                      )
                    }

                    if (speedometerCards.length === 2) {
                      // Two markets - show as 1x2 speedometer grid
                      return (
                        <Flex
                          key={`speedometer-${market.slug || market.address}`}
                          flexWrap='wrap'
                          gap={4}
                          w='full'
                        >
                          {speedometerCards.map((speedometerMarket, gridIndex) => (
                            <Box
                              key={speedometerMarket.slug || speedometerMarket.address}
                              flex='1 1 calc(50% - 8px)'
                              minW='calc(50% - 8px)'
                            >
                              <MarketCard
                                variant='grid'
                                market={speedometerMarket}
                                analyticParams={getAnalyticsParams(index, gridIndex, category)}
                              />
                            </Box>
                          ))}
                        </Flex>
                      )
                    }

                    if (speedometerCards.length === 3) {
                      // Three markets - show as 1x2 speedometer grid + 1 row
                      return (
                        <VStack
                          gap={4}
                          w='full'
                          key={`speedometer-group-${market.slug || market.address}`}
                        >
                          <Flex flexWrap='wrap' gap={4} w='full'>
                            {speedometerCards.slice(0, 2).map((speedometerMarket, gridIndex) => (
                              <Box
                                key={speedometerMarket.slug || speedometerMarket.address}
                                flex='1 1 calc(50% - 8px)'
                                minW='calc(50% - 8px)'
                              >
                                <MarketCard
                                  variant='grid'
                                  market={speedometerMarket}
                                  analyticParams={getAnalyticsParams(index, gridIndex, category)}
                                />
                              </Box>
                            ))}
                          </Flex>
                          <Box w='full'>
                            <MarketCard
                              variant='row'
                              market={speedometerCards[2]}
                              analyticParams={getAnalyticsParams(index, 2, category)}
                            />
                          </Box>
                        </VStack>
                      )
                    }

                    // Four markets - show as 2x2 speedometer grid
                    return (
                      <Flex
                        key={`speedometer-${market.slug || market.address}`}
                        flexWrap='wrap'
                        gap={4}
                        w='full'
                      >
                        {speedometerCards.map((speedometerMarket, gridIndex) => (
                          <Box
                            key={speedometerMarket.slug || speedometerMarket.address}
                            flex='1 1 calc(50% - 8px)'
                            minW='calc(50% - 8px)'
                          >
                            <MarketCard
                              variant='grid'
                              market={speedometerMarket}
                              analyticParams={getAnalyticsParams(index, gridIndex, category)}
                            />
                          </Box>
                        ))}
                      </Flex>
                    )
                  }
                  return null
                }
                return null
              })}

            {isLoading && (
              <>
                {[...Array(2)].map((_, cycleIndex) => (
                  <React.Fragment key={`cycle-${cycleIndex}`}>
                    {[...Array(2)].map((_, index) => (
                      <Box key={`skeleton-straight-${cycleIndex}-${index}`} w='full'>
                        <Skeleton height={144} />
                      </Box>
                    ))}
                    <Flex flexWrap='wrap' gap={4} w='full'>
                      {[...Array(4)].map((_, index) => (
                        <Box
                          key={`skeleton-grid-${cycleIndex}-${index}`}
                          flex='1 1 calc(50% - 8px)'
                          minW='calc(50% - 8px)'
                        >
                          <Skeleton height={164} />
                        </Box>
                      ))}
                    </Flex>
                  </React.Fragment>
                ))}
              </>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
