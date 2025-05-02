import { Box, Divider, HStack, Icon, Link, Text } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { ReferralLink } from '@/components/common/referral-link'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import FarcasterIcon from '@/resources/icons/Farcaster.svg'
import XIcon from '@/resources/icons/X.svg'
import BookIcon from '@/resources/icons/book-icon.svg'
import DiscordIcon from '@/resources/icons/discord-icon.svg'
import SidebarIcon from '@/resources/icons/sidebar/crone-icon.svg'
import { ClickEvent, ProfileBurgerMenuClickedMetadata, useAmplitude } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { captionRegular, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { SOCIAL_LINKS } from '@/utils/consts'

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

export default function DesktopFooter() {
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()
  const { handleCategory, handleDashboard } = useTokenFilter()
  return (
    <HStack
      w='full'
      position='fixed'
      bottom={0}
      borderTop='1px solid'
      borderColor='grey.100'
      zIndex={2500}
      py='4px'
      px='12px'
      justifyContent='space-between'
      bg='grey.50'
    >
      <HStack gap='8px'>
        <Box w='6px' h='6px' rounded='full' bg='green.500' />
        <Text {...captionRegular}>Operational</Text>
      </HStack>
      <HStack gap='8px'>
        <ReferralLink href='/blog' passHref>
          <Link
            onClick={() => {
              trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
                option: 'Leaderboard',
              })
              handleCategory(undefined)
              handleDashboard(undefined)
            }}
            _hover={{
              textDecoration: 'unset',
              color: 'grey.800',
            }}
            color='grey.500'
          >
            Blog
          </Link>
        </ReferralLink>
        <Divider orientation='vertical' h='16px' />
        <Link
          href={SOCIAL_LINKS.DOCS}
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
            <Icon as={BookIcon} w='16px' h='16px' />
            <Text {...paragraphMedium} color='inherit'>
              Docs
            </Text>
          </HStack>
        </Link>
        <Divider orientation='vertical' h='16px' />
        <Link
          href={SOCIAL_LINKS.FARCASTER}
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
          href={SOCIAL_LINKS.DISCORD}
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
          href={SOCIAL_LINKS.X}
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
