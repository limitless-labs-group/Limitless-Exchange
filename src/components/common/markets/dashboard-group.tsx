import { VStack, Text, Box, Flex } from '@chakra-ui/react'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import MarketCardMobile from './market-cards/market-card-mobile'
import { h2Bold } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { getAnalyticsParams } from '@/utils/market'

export enum DashboardGroupType {
  Mobile = 'mobile',
  Row = 'row',
  Grid = 'grid',
  Featured = 'featured',
  Compact = 'compact',
}

interface DashboardGroupProps {
  type: DashboardGroupType
  marketIndex: number
  categoryName: string
  markets: Market[]
}

export const DashboardGroup = ({
  markets,
  type,
  marketIndex,
  categoryName,
}: DashboardGroupProps) => {
  const dashboard = { fromDashboard: 'Market Crash' }
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
                    analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
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
                    analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
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
                  analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
                />
              </Box>
            ))}
          </Flex>
        )

      case DashboardGroupType.Featured:
        const rowStructure = [3, 2, 3, 1]
        let currentIndex = 0
        const gapSize = 12
        const generateFeaturedRows = () => {
          const allRows = []

          while (currentIndex < markets.length) {
            for (let rowIndex = 0; rowIndex < rowStructure.length; rowIndex++) {
              const columnsInRow = rowStructure[rowIndex]
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
                if (currentIndex < markets.length) {
                  const market = markets[currentIndex]
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
                        analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
                      />
                    </Box>
                  )
                  currentIndex++
                }
              }

              if (rowItems.length > 0) {
                allRows.push(
                  <Flex
                    key={`row-${allRows.length}`}
                    w='full'
                    gap={`${gapSize}px`}
                    justifyContent='space-between'
                  >
                    {rowItems}
                  </Flex>
                )
              }

              if (currentIndex >= markets.length) {
                break
              }
            }
          }
          return allRows
        }

        return (
          <VStack spacing={4} w='full'>
            {generateFeaturedRows()}
          </VStack>
        )

      case DashboardGroupType.Compact:
        const gapSizeCompact = 12

        return (
          <VStack spacing={4} w='full'>
            <Box width='full'>
              <MarketCard
                variant='chart'
                market={markets[0]}
                analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
              />
            </Box>

            {markets.length > 1 && (
              <Flex w='full' gap={`${gapSizeCompact}px`} justifyContent='space-between'>
                {markets.slice(1, 4).map((market, index) => {
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
                        analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
                      />
                    </Box>
                  )
                })}
              </Flex>
            )}

            {markets.length > 4 && (
              <Box width='full'>
                <MarketCard
                  variant='row'
                  market={markets[4]}
                  analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
                />
              </Box>
            )}
            {markets.length > 5 && (
              <Flex w='full' gap={`${gapSizeCompact}px`} justifyContent='space-between'>
                {markets.slice(5, markets.length).map((market, index) => {
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
                        analyticParams={getAnalyticsParams(marketIndex, 0, dashboard)}
                      />
                    </Box>
                  )
                })}
              </Flex>
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
