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
  useAccount,
  useAmplitude,
  useTradingService,
} from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { appendReferralCode } from '@/utils/market'

export default function ShareMenu() {
  const { isOpen: isShareMenuOpen, onToggle: toggleShareMenu } = useDisclosure()
  const { market, groupMarket } = useTradingService()
  const { trackClicked } = useAmplitude()
  const { referralCode } = useAccount()
  const toast = useToast()
  const marketURI =
    market?.marketType === 'group'
      ? `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${groupMarket?.slug}`
      : `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${market?.slug}`
  const { tweetURI, castURI } = createMarketShareUrls(
    market?.marketType === 'group' ? groupMarket : market,
    market?.prices,
    market?.creator.name
  )

  const getUrl = (referralCode: string) => {
    return referralCode ? appendReferralCode(marketURI, referralCode) : marketURI
  }
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
        bg='unset'
        border='1px solid'
        borderColor='grey.100'
        _hover={{
          bg: 'grey.100',
        }}
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
            text={getUrl(referralCode)}
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
