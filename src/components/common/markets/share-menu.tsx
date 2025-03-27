import {
  Box,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
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
  const { market } = useTradingService()
  const { trackClicked } = useAmplitude()
  const toast = useToast()
  const marketURI = `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${market?.slug}`
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
        as={isMobile ? 'div' : undefined}
      >
        {isMobile ? (
          <Box mt='4px'>
            <ShareIcon width={20} height={20} />
          </Box>
        ) : (
          <HStack gap='4px'>
            <ShareIcon width={16} height={16} />
            <Text {...paragraphMedium}>Share</Text>
          </HStack>
        )}
      </MenuButton>
      <MenuList borderRadius='8px' w={isMobile ? '160px' : '122px'} zIndex={2}>
        <MenuItem
          onClick={() => {
            trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
              type: 'Farcaster',
              address: market?.slug,
              marketType: 'single',
            })
            window.open(castURI, '_blank', 'noopener')
          }}
        >
          <HStack gap='4px' w='full'>
            <WarpcastIcon width={16} height={16} />
            <Text whiteSpace='nowrap' {...paragraphMedium}>
              On Warpcast
            </Text>
          </HStack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
              type: 'X/Twitter',
              address: market?.slug,
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
          {/*// @ts-ignore*/}
          <CopyToClipboard
            text={marketURI}
            onCopy={() => {
              trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                type: 'Copy Link',
                address: market?.slug,
                marketType: 'single',
              })
              const id = toast({
                render: () => <Toast title={'Copied'} id={id} />,
              })
            }}
          >
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
