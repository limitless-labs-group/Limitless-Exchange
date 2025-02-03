import { Box, Divider, HStack, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'
import Marquee from 'react-fast-marquee'
import { useThemeProvider } from '@/providers'
import { ClickEvent, useAmplitude } from '@/services'
import { captionRegular } from '@/styles/fonts/fonts.styles'

export default function MigrateMarquee() {
  const [pauseMarquee, setPauseMarquee] = useState<boolean>(false)
  const { colors } = useThemeProvider()
  const { trackClicked } = useAmplitude()

  return (
    <Box
      onClick={() => {
        trackClicked(ClickEvent.StrokeClicked, {
          changeTo: !pauseMarquee ? 'pause' : 'run',
        })
        setPauseMarquee(!pauseMarquee)
      }}
    >
      <Marquee
        play={!pauseMarquee}
        style={{
          height: '20px',
          background: colors.blue['500'],
          position: 'fixed',
          top: 0,
          zIndex: 300,
          cursor: 'pointer',
        }}
      >
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <Text {...captionRegular} textTransform='uppercase' color='white'>
            We improved the speed of transactions.
          </Text>
          <NextLink
            href='https://www.notion.so/limitlesslabs/Wallet-Upgrade-16104e33c4b980609633cf09dc032242'
            target='_blank'
            rel='noopener'
            passHref
          >
            <Link
              variant='textLinkSecondary'
              {...captionRegular}
              isExternal
              color='white'
              textTransform='uppercase'
              textDecoration='underline'
            >
              Upgrade wallet
            </Link>
          </NextLink>
        </HStack>
        <Divider orientation='vertical' color='white' height='16px' borderColor='white' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <Text {...captionRegular} textTransform='uppercase' color='white'>
            We improved the speed of transactions.
          </Text>
          <NextLink
            href='https://www.notion.so/limitlesslabs/Wallet-Upgrade-16104e33c4b980609633cf09dc032242'
            target='_blank'
            rel='noopener'
            passHref
          >
            <Link
              variant='textLinkSecondary'
              {...captionRegular}
              isExternal
              color='white'
              textTransform='uppercase'
              textDecoration='underline'
            >
              Upgrade wallet
            </Link>
          </NextLink>
        </HStack>
        <Divider orientation='vertical' color='white' height='16px' borderColor='white' />
      </Marquee>
    </Box>
  )
}
