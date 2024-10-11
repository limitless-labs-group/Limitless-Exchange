import { useTradingService } from '@/services'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components'
import MarketGroupPredictions from '@/components/common/markets/market-group-predictions'
import { isMobile } from 'react-device-detect'
import NextLink from 'next/link'
import { Box, Link, Text } from '@chakra-ui/react'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import MarketGroupPositions from '@/app/(markets)/market-group/[slug]/components/market-group-positions'

export default function MarketPageOverviewTab() {
  const { market, marketGroup } = useTradingService()

  return (
    <>
      {marketGroup ? (
        <MarketGroupPositions marketGroup={marketGroup} />
      ) : (
        <MarketPositions market={market} />
      )}
      <MarketGroupPredictions />
      <Box w={isMobile ? 'full' : 'fit-content'} mt='16px' mb={isMobile ? '48px' : 0}>
        <NextLink
          href='https://www.notion.so/limitlesslabs/Limitless-Docs-0e59399dd44b492f8d494050969a1567?pvs=4#5dd6f962c66044eaa00e28d2c61b92bb'
          target='_blank'
          rel='noopener'
          passHref
        >
          <Link variant='textLink' {...paragraphRegular} color='grey.500' isExternal>
            Resolution is centralised
          </Link>
        </NextLink>
        <Text {...paragraphRegular} color='grey.500' as='span'>
          {' '}
          and made by the Limitless team
        </Text>
        <Text mt='16px' {...paragraphRegular}>
          {market?.description}
        </Text>
      </Box>
    </>
  )
}