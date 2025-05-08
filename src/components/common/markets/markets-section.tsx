import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import MarketCardMobile from '@/components/common/markets/market-cards/market-card-mobile'
import VolumeCard from '@/components/common/markets/volume-card'
import Skeleton from '@/components/common/skeleton'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { h3Medium, headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market, Sort, SortStorageName } from '@/types'
import { getAnalyticsParams } from '@/utils/market'
import SortFilter from '../sort-filter'

interface DailyMarketsSectionProps {
  markets?: Market[]
  handleSelectSort: (option: Sort, name: SortStorageName) => void
  isLoading: boolean
  sort: Sort
  withChat?: boolean
  categoryName?: string
}

export default function MarketsSection({
  markets,
  handleSelectSort,
  isLoading,
  sort,
  withChat,
  categoryName,
}: DailyMarketsSectionProps) {
  const { selectedCategory } = useTokenFilter()
  const category = useMemo(() => {
    return selectedCategory ? { fromCategory: selectedCategory.name } : {}
  }, [selectedCategory])

  const allMarkets = markets || []

  return (
    <Box
      mt='24px'
      mb={isMobile ? '36px' : '40px'}
      w={isMobile ? 'full' : withChat ? '100%' : '664px'}
      justifyContent='center'
    >
      <Box>
        {!withChat ? (
          <Divider orientation='horizontal' borderColor='grey.100' mx={isMobile ? '16px' : 0} />
        ) : null}

        <Flex
          alignItems={withChat ? 'center' : 'center'}
          justifyContent='space-between'
          flexDirection={isMobile ? 'column' : 'row'}
          overflow='scroll'
        >
          {withChat ? (
            <Text {...h3Medium} mt={isMobile ? '8px' : '0px'} ml='16px'>
              {selectedCategory?.name ?? categoryName}
            </Text>
          ) : (
            <Text {...headlineRegular} mt={isMobile ? '8px' : '0px'}>
              All Markets
            </Text>
          )}
          <SortFilter onChange={handleSelectSort} sort={sort} />
        </Flex>
        {withChat ? (
          <Divider orientation='horizontal' borderColor='grey.100' mx={isMobile ? '16px' : 0} />
        ) : null}
      </Box>
      {isMobile ? (
        <VStack gap={2} w='full' px='16px' mt='16px'>
          {isLoading ? (
            [...Array(3)].map((_, index) => <Skeleton height={200} key={index} />)
          ) : (
            <>
              {allMarkets?.map((market, index) => {
                const cyclePosition = index % 10

                // Insert VolumeCard after the 6th market
                if (index === 6) {
                  return (
                    <React.Fragment key={`volume-card-${index}`}>
                      <VolumeCard />
                      <MarketCardMobile
                        key={market.slug || market.address}
                        market={market}
                        variant={
                          cyclePosition >= 6 && cyclePosition < 10 ? 'speedometer' : undefined
                        }
                        analyticParams={getAnalyticsParams(index, 0, category)}
                        markets={markets}
                      />
                    </React.Fragment>
                  )
                }

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
            </>
          )}
        </VStack>
      ) : (
        <Box mt='24px'>
          <VStack gap={4} w='full'>
            {!isLoading && (
              <>
                {withChat ? (
                  <>
                    {allMarkets?.map((market, index) => {
                      const cyclePosition = index % 5 // 5 = 3 (for 3-col) + 2 (for 2-col)

                      // First 3 markets in cycle - 3-column grid with row variant
                      if (cyclePosition < 3) {
                        const isGridStart = cyclePosition === 0
                        if (isGridStart) {
                          // Get up to 3 cards for the grid
                          const remainingCount = Math.min(3, allMarkets.length - index)
                          const gridCards = allMarkets.slice(index, index + remainingCount)

                          return (
                            <Flex
                              key={`grid-3col-${market.slug || market.address}`}
                              flexWrap='wrap'
                              gap={4}
                              w='full'
                              mb={4}
                            >
                              {gridCards.map((gridMarket, gridIndex) => (
                                <Box
                                  key={gridMarket.slug || gridMarket.address}
                                  flex='1 1 calc(33.33% - 8px)'
                                  minW='calc(33.33% - 8px)'
                                >
                                  <MarketCard
                                    variant='row'
                                    market={gridMarket}
                                    analyticParams={getAnalyticsParams(
                                      index + gridIndex,
                                      gridIndex,
                                      category
                                    )}
                                  />
                                </Box>
                              ))}
                            </Flex>
                          )
                        }
                        return null
                      }

                      // Next 2 markets - 2-column grid with speedometer variant
                      if (cyclePosition >= 3 && cyclePosition < 5) {
                        const isGridStart = cyclePosition === 3
                        if (isGridStart) {
                          // Get up to 2 cards for the grid
                          const remainingCount = Math.min(2, allMarkets.length - index)
                          const gridCards = allMarkets.slice(index, index + remainingCount)

                          return (
                            <Flex
                              key={`grid-2col-${market.slug || market.address}`}
                              flexWrap='wrap'
                              gap={4}
                              w='full'
                              mb={4}
                            >
                              {gridCards.map((gridMarket, gridIndex) => (
                                <Box
                                  key={gridMarket.slug || gridMarket.address}
                                  flex='1 1 calc(50% - 8px)'
                                  minW='calc(50% - 8px)'
                                >
                                  <MarketCard
                                    variant='speedometer'
                                    market={gridMarket}
                                    analyticParams={getAnalyticsParams(
                                      index + gridIndex,
                                      gridIndex,
                                      category
                                    )}
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
                    <Box w='full' mt={2}>
                      <VolumeCard />
                    </Box>
                  </>
                ) : (
                  <>
                    {allMarkets?.map((market, index) => {
                      // Use a single cycle pattern for all markets
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
                          // Get up to 4 cards for the grid
                          const gridCards = allMarkets.slice(index, index + 4)

                          // Insert VolumeCard after the first grid (at index 2)
                          const includeVolumeCard = index === 2

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
                                    analyticParams={getAnalyticsParams(
                                      index + gridIndex,
                                      gridIndex,
                                      category
                                    )}
                                  />
                                </Box>
                              ))}
                              {includeVolumeCard && <VolumeCard />}
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
                          // Get remaining cards for this cycle
                          const remainingCount = Math.min(4, allMarkets.length - index)
                          const speedometerCards = allMarkets.slice(index, index + remainingCount)

                          if (speedometerCards.length === 1) {
                            // Single market - show as row
                            return (
                              <Box
                                key={speedometerCards[0].slug || speedometerCards[0].address}
                                w='full'
                              >
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
                                      analyticParams={getAnalyticsParams(
                                        index + gridIndex,
                                        gridIndex,
                                        category
                                      )}
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
                                  {speedometerCards
                                    .slice(0, 2)
                                    .map((speedometerMarket, gridIndex) => (
                                      <Box
                                        key={speedometerMarket.slug || speedometerMarket.address}
                                        flex='1 1 calc(50% - 8px)'
                                        minW='calc(50% - 8px)'
                                      >
                                        <MarketCard
                                          variant='grid'
                                          market={speedometerMarket}
                                          analyticParams={getAnalyticsParams(
                                            index + gridIndex,
                                            gridIndex,
                                            category
                                          )}
                                        />
                                      </Box>
                                    ))}
                                </Flex>
                                <Box w='full'>
                                  <MarketCard
                                    variant='row'
                                    market={speedometerCards[2]}
                                    analyticParams={getAnalyticsParams(index + 2, 2, category)}
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
                                    analyticParams={getAnalyticsParams(
                                      index + gridIndex,
                                      gridIndex,
                                      category
                                    )}
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
                  </>
                )}
              </>
            )}

            {isLoading && (
              <>
                {[...Array(2)].map((_, cycleIndex) => (
                  <React.Fragment key={`cycle-${cycleIndex}`}>
                    {[...Array(2)].map((_, index) => (
                      <Box key={`skeleton-straight-${cycleIndex}-${index}`} w='full'>
                        <Skeleton height={160} />
                      </Box>
                    ))}
                    <Flex flexWrap='wrap' gap={4} w='full'>
                      {[...Array(4)].map((_, index) => (
                        <Box
                          key={`skeleton-grid-${cycleIndex}-${index}`}
                          flex='1 1 calc(50% - 8px)'
                          minW='calc(50% - 8px)'
                        >
                          <Skeleton height={165} />
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
