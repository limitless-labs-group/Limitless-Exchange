import { BoxProps, HStack, Icon, Link, Text } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { isMobile } from 'react-device-detect'
import FarcasterIcon from '@/resources/icons/Farcaster.svg'
import XIcon from '@/resources/icons/X.svg'
import BookIcon from '@/resources/icons/book-icon.svg'
import DiscordIcon from '@/resources/icons/discord-icon.svg'
import { ClickEvent, useAmplitude } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { DISCORD_LINK } from '@/utils/consts'

const LINKS = {
  X: 'https://x.com/trylimitless',
  DISCORD: DISCORD_LINK,
  FARCASTER: 'https://warpcast.com/~/channel/limitless',
  DOCS: 'https://www.notion.so/limitlesslabs/Limitless-Exchange-Docs-0e59399dd44b492f8d494050969a1567?pvs=4',
}

const ICON_PROPS = {
  w: isMobile ? '20px' : '16px',
  h: isMobile ? '20px' : '16px',
  verticalAlign: 'middle',
}

const ICON_WITHOUT_TEXT_PROPS = {
  ...ICON_PROPS,
  color: 'grey.500',
  _hover: { color: 'grey.800' },
}

export default function SocialsFooter({ ...props }: PropsWithChildren<BoxProps>) {
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()

  return (
    <HStack justifyContent='space-between' spacing={4} w='full' mt='4px' px='8px' {...props}>
      <Link
        href={LINKS.DOCS}
        target='_blank'
        rel='noopener noreferrer'
        onClick={() => {
          trackClicked(ClickEvent.LimitlessLinksClicked, {
            platform: isMobile ? 'mobile' : 'desktop',
            option: 'docs',
          })
        }}
        _hover={{
          textDecoration: 'unset',
        }}
      >
        <HStack
          gap='4px'
          color='grey.500'
          _hover={{
            color: 'grey.800',
          }}
        >
          <Icon as={BookIcon} {...ICON_PROPS} />
          <Text {...paragraphMedium} color='inherit'>
            Docs
          </Text>
        </HStack>
      </Link>

      <HStack gap='8px'>
        <Link
          href={LINKS.DISCORD}
          target='_blank'
          rel='noopener noreferrer'
          onClick={() => {
            trackClicked(ClickEvent.LimitlessLinksClicked, {
              platform: isMobile ? 'mobile' : 'desktop',
              option: 'discord',
            })
            pushGA4Event(GAEvents.SocialDiscord)
          }}
        >
          <Icon as={DiscordIcon} {...ICON_WITHOUT_TEXT_PROPS} />
        </Link>
        <Link
          href={LINKS.FARCASTER}
          target='_blank'
          rel='noopener noreferrer'
          onClick={() => {
            trackClicked(ClickEvent.LimitlessLinksClicked, {
              platform: isMobile ? 'mobile' : 'desktop',
              option: 'farcaster',
            })

            pushGA4Event(GAEvents.SocialWarpcast)
          }}
        >
          <Icon as={FarcasterIcon} {...ICON_WITHOUT_TEXT_PROPS} />
        </Link>
        <Link
          href={LINKS.X}
          target='_blank'
          rel='noopener noreferrer'
          onClick={() => {
            trackClicked(ClickEvent.LimitlessLinksClicked, {
              platform: isMobile ? 'mobile' : 'desktop',
              option: 'x',
            })

            pushGA4Event(GAEvents.SocialX)
          }}
        >
          <Icon as={XIcon} {...ICON_WITHOUT_TEXT_PROPS} />
        </Link>
      </HStack>
    </HStack>
  )
}
