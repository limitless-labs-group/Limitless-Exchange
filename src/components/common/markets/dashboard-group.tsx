import { VStack, Text, Box, Flex } from '@chakra-ui/react'
import { MarketCard } from './market-cards'
import MarketCardMobile from './market-cards/market-card-mobile'
import { h2Bold } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

export enum DashboardGroupType {
  Mobile = 'mobile',
  Row = 'row',
  Grid = 'grid',
  Featured = 'featured',
  Compact = 'compact',
}

interface DashboardGroupProps {
  type: DashboardGroupType
  categoryName: string
  markets: Market[]
}

export const DashboardGroup = ({ markets, type, categoryName }: DashboardGroupProps) => {
  const showCardLayout = (type: DashboardGroupType) => {
    switch (type) {
      case DashboardGroupType.Mobile:
        return (
          <VStack gap={4} w='full'>
            {markets.map((market, index) => {
              return (
                <Box key={market.id} width='full'>
                  <MarketCardMobile
                    markets={markets}
                    market={market}
                    variant={index === 0 ? 'chart' : 'row'}
                    analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: 1 }}
                  />
                </Box>
              )
            })}
          </VStack>
        )

      case DashboardGroupType.Row:
        return (
          <VStack gap={4} w='full'>
            {markets.map((market, index) => {
              return (
                <Box key={market.id} width='full'>
                  <MarketCard
                    market={market}
                    variant={index === 0 ? 'chart' : 'row'}
                    analyticParams={{ bannerPosition: index + 1, bannerPaginationPage: 1 }}
                  />
                </Box>
              )
            })}
          </VStack>
        )

      case DashboardGroupType.Grid:
        return (
          <Flex flexWrap='wrap' gap={4} w='full'>
            {markets.map((gridMarket) => (
              <Box
                key={gridMarket.slug || gridMarket.address}
                flex='1 1 calc(50% - 8px)'
                minW='calc(50% - 8px)'
              >
                <MarketCard
                  variant='grid'
                  market={gridMarket}
                  analyticParams={{
                    bannerPosition: 1,
                    bannerPaginationPage: 1,
                  }}
                />
              </Box>
            ))}
          </Flex>
        )

      case DashboardGroupType.Featured:
        const featuredMarkets = markets.slice(0, 9)
        const rowStructure = [3, 2, 3, 1]
        let currentIndex = 0
        const gapSize = 12

        return (
          <VStack spacing={4} w='full'>
            {rowStructure.map((columnsInRow, rowIndex) => {
              const totalGapWidth = (columnsInRow - 1) * gapSize

              const columnWidth =
                columnsInRow === 1 ? '100%' : `calc((100% - ${totalGapWidth}px) / ${columnsInRow})`

              const getVariant = (rowIndex: number, columnsInRow: number) => {
                if (rowIndex === 1 || rowIndex === 2) {
                  return 'speedometer'
                } else if (columnsInRow === 1) {
                  return 'row'
                } else {
                  return 'grid'
                }
              }

              const rowItems = []
              for (let i = 0; i < columnsInRow; i++) {
                if (currentIndex < featuredMarkets.length) {
                  const market = featuredMarkets[currentIndex]
                  rowItems.push(
                    <Box
                      key={market.slug || market.address}
                      width={columnWidth}
                      flexShrink={0}
                      flexGrow={0}
                    >
                      <MarketCard
                        variant={getVariant(rowIndex, columnsInRow)}
                        market={market}
                        analyticParams={{
                          bannerPosition: currentIndex + 1,
                          bannerPaginationPage: 1,
                        }}
                      />
                    </Box>
                  )
                  currentIndex++
                }
              }

              return (
                <Flex
                  key={`row-${rowIndex}`}
                  w='full'
                  gap={`${gapSize}px`}
                  justifyContent='space-between'
                >
                  {rowItems}
                </Flex>
              )
            })}
          </VStack>
        )

      case DashboardGroupType.Compact:
        const compactMarkets = markets.slice(0, 5)
        const gapSizeCompact = 12

        if (compactMarkets.length === 0) return <></>

        return (
          <VStack spacing={4} w='full'>
            <Box width='full'>
              <MarketCard
                variant='chart'
                market={compactMarkets[0]}
                analyticParams={{
                  bannerPosition: 1,
                  bannerPaginationPage: 1,
                }}
              />
            </Box>

            {compactMarkets.length > 1 && (
              <Flex w='full' gap={`${gapSizeCompact}px`} justifyContent='space-between'>
                {compactMarkets.slice(1, 4).map((market, index) => {
                  const totalGapWidth = 2 * gapSizeCompact
                  const columnWidth = `calc((100% - ${totalGapWidth}px) / 3)`

                  return (
                    <Box
                      key={market.slug || market.address}
                      width={columnWidth}
                      flexShrink={0}
                      flexGrow={0}
                    >
                      <MarketCard
                        variant='grid'
                        market={market}
                        analyticParams={{
                          bannerPosition: index + 2,
                          bannerPaginationPage: 1,
                        }}
                      />
                    </Box>
                  )
                })}
              </Flex>
            )}

            {compactMarkets.length > 4 && (
              <Box width='full'>
                <MarketCard
                  variant='row'
                  market={compactMarkets[4]}
                  analyticParams={{
                    bannerPosition: 5,
                    bannerPaginationPage: 1,
                  }}
                />
              </Box>
            )}
          </VStack>
        )

      default:
        return <></>
    }
  }

  return (
    <VStack w='full'>
      <Text {...h2Bold} textAlign='start' w='full'>
        {categoryName}
      </Text>
      <Box mt='20px' width='full'>
        {showCardLayout(type)}
      </Box>
    </VStack>
  )
}
