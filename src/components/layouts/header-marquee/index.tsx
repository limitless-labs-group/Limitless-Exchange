import { Box, Divider, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Marquee from 'react-fast-marquee'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import { useThemeProvider } from '@/providers'
import BaseIcon from '@/resources/icons/base-icon-white.svg'
import DifferentTokensIcon from '@/resources/icons/different-tokens.svg'
import MarketsByCommunityIcon from '@/resources/icons/markets-by-community.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { captionRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function HeaderMarquee() {
  const [pauseMarquee, setPauseMarquee] = useState<boolean>(false)
  const { colors } = useThemeProvider()
  const { trackClicked } = useAmplitude()
  const { data: totalVolume } = useTotalTradingVolume()

  const volume = totalVolume ? `$${NumberUtil.formatThousands(totalVolume.toFixed(0), 0)}` : ''

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
          background: colors.grey['800'],
          position: 'fixed',
          top: 0,
          zIndex: 300,
          cursor: 'pointer',
        }}
      >
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <DifferentTokensIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <DifferentTokensIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <DifferentTokensIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <DifferentTokensIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <DifferentTokensIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <DifferentTokensIcon />}
          <Text {...captionRegular} textTransform='uppercase'>
            {isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
          </Text>
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
      </Marquee>
    </Box>
  )
}
