import { VStack, Text, Box, Flex } from '@chakra-ui/react'
import { MarketCard } from './market-cards'
import { h2Bold } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

export type DashboardGroupType = 'row' | 'grid' | 'featured'

interface DashboardGroupProps {
  type: DashboardGroupType
  categoryName: string
  markets: Market[]
}

export const DashboardGroup = ({ markets, type, categoryName }: DashboardGroupProps) => {
  const showCardLayout = (type: DashboardGroupType) => {
    switch (type) {
      case 'row':
        const rowMarkets = markets.slice(0, 2)
        return (
          <VStack gap={4} w='full'>
            {rowMarkets.map((market, index) => {
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

      case 'grid':
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

      case 'featured':
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
