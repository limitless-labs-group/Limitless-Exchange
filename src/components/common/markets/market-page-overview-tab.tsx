import { Box, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import { useTradingService } from '@/services'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import TextEditor from '../text-editor'

export default function MarketPageOverviewTab() {
  const { market } = useTradingService()

  return (
    <>
      <Box w={isMobile ? 'full' : 'fit-content'} mt='16px' pb={isMobile ? '64px' : 0}>
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

        <Text mt='16px' {...paragraphRegular}>
          <TextEditor value={market?.description ?? ''} readOnly={true} />
        </Text>
      </Box>
    </>
  )
}
