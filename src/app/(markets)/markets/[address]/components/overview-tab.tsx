import { Box, HStack, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import MarketGroupPositions from '@/app/(markets)/market-group/[slug]/components/market-group-positions'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components/market-positions'
import { MarketPriceChart } from '@/app/(markets)/markets/[address]/components/market-price-chart'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import { paragraphBold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Category, Market, MarketGroup, MarketStatus } from '@/types'
import { parseTextWithLinks } from '@/utils/string'

interface MarketOverviewTabProps {
  market: Market
  marketGroup?: MarketGroup
}

function MarketOverviewTab({ market, marketGroup }: MarketOverviewTabProps) {
  return (
    <>
      <MarketPriceChart />
      {marketGroup && <MarketGroupPositions marketGroup={marketGroup} />}
      <MarketPositions market={market} />
      <HStack
        w='full'
        justifyContent='space-between'
        alignItems={isMobile ? 'flex-start' : 'center'}
        marginTop='24px'
        mb='8px'
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <HStack gap='4px'>
          <ResolutionIcon width='16px' height='16px' />
          <Text {...paragraphBold}>
            Resolution {market.status !== MarketStatus.RESOLVED ? 'rules' : 'results'}
          </Text>
        </HStack>
        <Box w={isMobile ? 'full' : 'fit-content'}>
          {market?.category !== 'Lumy' ? (
            <>
              <NextLink
                href='https://www.notion.so/limitlesslabs/Limitless-Docs-0e59399dd44b492f8d494050969a1567?pvs=4#5dd6f962c66044eaa00e28d2c61b92bb'
                target='_blank'
                rel='noopener'
                passHref
              >
                <Link variant='textLinkSecondary' {...paragraphRegular} isExternal color='grey.500'>
                  Resolution is centralised
                </Link>
              </NextLink>
              <Text {...paragraphRegular} color='grey.500' as='span'>
                {' '}
                and made by the Limitless team
              </Text>
            </>
          ) : (
            <Link variant='textLinkSecondary' {...paragraphRegular} isExternal color='grey.500'>
              Resolution is decentralised
            </Link>
          )}
        </Box>
      </HStack>
      <Text {...paragraphRegular} userSelect='text'>
        {parseTextWithLinks(market?.description)}
      </Text>
    </>
  )
}

export default MarketOverviewTab
