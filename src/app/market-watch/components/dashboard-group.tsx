import { VStack, Text, Box, Flex, HStack, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import usePageName from '@/hooks/use-page-name'
import { ClickEvent, useAmplitude } from '@/services'
import { h2Bold, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { getAnalyticsParams } from '@/utils/market'
import MarketCardMobile from '../../../components/common/markets/market-cards/market-card-mobile'

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
  const dashboard = { fromDashboard: 'Market Watch' }

  const { trackClicked } = useAmplitude()
  const pageName = usePageName()

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
        const totalGapWidth = 2 * gapSizeCompact
        const columnWidth = `calc((100% - ${totalGapWidth}px) / 3)`

        // Generate rows in the pattern: chart, 3-col grid, row, 3-col grid, repeat
        const generateCompactRows = () => {
          const rows = []
          let currentIndex = 0

          while (currentIndex < markets.length) {
            // 1. Chart row
            if (currentIndex < markets.length) {
              rows.push(
                <Box key={`chart-${currentIndex}`} width='full'>
                  <MarketCard
                    variant='chart'
                    market={markets[currentIndex]}
                    analyticParams={getAnalyticsParams(marketIndex, currentIndex, dashboard)}
                  />
                </Box>
              )
              currentIndex++
            }

            // 2. 3-column grid
            if (currentIndex < markets.length) {
              const gridItems = []
              for (let i = 0; i < 3 && currentIndex < markets.length; i++) {
                gridItems.push(
                  <Box
                    key={markets[currentIndex].slug || markets[currentIndex].address}
                    width={columnWidth}
                    flexShrink={0}
                    flexGrow={0}
                  >
                    <MarketCard
                      variant='grid'
                      market={markets[currentIndex]}
                      analyticParams={getAnalyticsParams(marketIndex, currentIndex, dashboard)}
                    />
                  </Box>
                )
                currentIndex++
              }

              if (gridItems.length > 0) {
                rows.push(
                  <Flex
                    key={`grid-1-${currentIndex}`}
                    w='full'
                    gap={`${gapSizeCompact}px`}
                    justifyContent='space-between'
                  >
                    {gridItems}
                  </Flex>
                )
              }
            }

            // 3. Row
            if (currentIndex < markets.length) {
              rows.push(
                <Box key={`row-${currentIndex}`} width='full'>
                  <MarketCard
                    variant='row'
                    market={markets[currentIndex]}
                    analyticParams={getAnalyticsParams(marketIndex, currentIndex, dashboard)}
                  />
                </Box>
              )
              currentIndex++
            }

            // 4. 3-column grid again
            if (currentIndex < markets.length) {
              const gridItems = []
              for (let i = 0; i < 3 && currentIndex < markets.length; i++) {
                gridItems.push(
                  <Box
                    key={markets[currentIndex].slug || markets[currentIndex].address}
                    width={columnWidth}
                    flexShrink={0}
                    flexGrow={0}
                  >
                    <MarketCard
                      variant='grid'
                      market={markets[currentIndex]}
                      analyticParams={getAnalyticsParams(marketIndex, currentIndex, dashboard)}
                    />
                  </Box>
                )
                currentIndex++
              }

              if (gridItems.length > 0) {
                rows.push(
                  <Flex
                    key={`grid-2-${currentIndex}`}
                    w='full'
                    gap={`${gapSizeCompact}px`}
                    justifyContent='space-between'
                  >
                    {gridItems}
                  </Flex>
                )
              }
            }
          }

          return rows
        }

        return (
          <VStack spacing={4} w='full'>
            {generateCompactRows()}
          </VStack>
        )

      default:
        return <></>
    }
  }

  return (
    <VStack w='full'>
      <HStack justifyContent='space-between' w='full' mt='24px'>
        <Text {...h2Bold} textAlign='start' w='full'>
          {categoryName}
        </Text>
        <NextLink href={`/?category=${categoryName}`}>
          <Link variant='transparent' px={0} _hover={{ textDecoration: 'none' }}>
            <HStack
              w='full'
              h='24px'
              rounded='8px'
              bg='grey.100'
              px={'8px'}
              cursor='pointer'
              whiteSpace='nowrap'
              _hover={{
                '& > p': {
                  textDecoration: 'underline',
                },
              }}
              onClick={() => {
                trackClicked(ClickEvent.SeeMoreCkicked, {
                  name: categoryName,
                  page: pageName,
                })
              }}
            >
              <Text {...paragraphMedium} fontWeight={500} color='grey.800'>
                See more
              </Text>
            </HStack>
          </Link>
        </NextLink>
      </HStack>
      <Box mt='20px' width='full'>
        {showCardLayout(type)}
      </Box>
    </VStack>
  )
}
