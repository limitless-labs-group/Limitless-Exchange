import { Box, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import MarketGroupPredictions from '@/components/common/markets/market-group-predictions'
import MarketGroupPositions from '@/app/(markets)/market-group/[slug]/components/market-group-positions'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components'
import { useTradingService } from '@/services'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { parseTextWithLinks } from '@/utils/string'

export default function MarketPageOverviewTab() {
  const { market, marketGroup } = useTradingService()

  const resolutionText =
    'https://www.notion.so/limitlesslabs/Limitless-Docs-0e59399dd44b492f8d494050969a1567?pvs=4#5dd6f962c66044eaa00e28d2c61b92bb and made by Limitless team.'

  return (
    <>
      {marketGroup ? (
        <MarketGroupPositions marketGroup={marketGroup} />
      ) : (
        <MarketPositions market={market} />
      )}
      <MarketGroupPredictions />
      <Box w={isMobile ? 'full' : 'fit-content'} mt='16px' pb={isMobile ? '64px' : 0}>
        <Text {...paragraphRegular} color='grey.500'>
          {parseTextWithLinks(resolutionText, 'Resolution is centralised', 'textLinkSecondary')}
        </Text>
        <Text mt='16px' {...paragraphRegular}>
          {parseTextWithLinks(market?.description || '')}
        </Text>
      </Box>
    </>
  )
}
