import { HStack, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import CopyIcon from '@/resources/icons/link-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import {
  ClickEvent,
  createMarketShareUrls,
  ShareClickedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function ShareMenu() {
  const { isOpen: isShareMenuOpen, onToggle: toggleShareMenu } = useDisclosure()
  const { market, marketGroup } = useTradingService()
  const { trackClicked } = useAmplitude()
  const marketURI = marketGroup
    ? `${process.env.NEXT_PUBLIC_FRAME_URL}/market-group/${marketGroup.slug}`
    : `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${market?.address}`
  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices, market?.creator.name)
  return (
    <Menu isOpen={isShareMenuOpen} onClose={toggleShareMenu}>
      <MenuButton
        onClick={() => {
          // trackClicked(ClickEvent.ShareMenuClicked, {
          //   address: market?.address,
          //   marketType: 'single',
          // })
          toggleShareMenu()
        }}
        as={'div'}
      >
        {isMobile ? (
          <ShareIcon width={16} height={16} />
        ) : (
          <>
            <ShareIcon width={16} height={16} />
            <Text {...paragraphMedium}>Share</Text>
          </>
        )}
      </MenuButton>
      <MenuList borderRadius='2px' w={isMobile ? '160px' : '122px'} zIndex={2}>
        <MenuItem
          onClick={() => {
            trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
              type: 'Farcaster',
              address: market?.address,
              marketType: 'single',
            })
            window.open(castURI, '_blank', 'noopener')
          }}
        >
          <HStack gap='4px' w='full'>
            <WarpcastIcon width={16} height={16} />
            <Text {...paragraphMedium}>On Warpcast</Text>
          </HStack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
              type: 'X/Twitter',
              address: market?.address,
              marketType: 'single',
            })
            window.open(tweetURI, '_blank', 'noopener')
          }}
        >
          <HStack gap='4px' w='full'>
            <TwitterIcon width={16} height={16} />
            <Text {...paragraphMedium}>On X</Text>
          </HStack>
        </MenuItem>
        <MenuItem>
          <CopyToClipboard text={marketURI}>
            <HStack gap='4px' w='full'>
              <CopyIcon width={16} height={16} />
              <Text {...paragraphMedium}>Copy Link</Text>
            </HStack>
          </CopyToClipboard>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
