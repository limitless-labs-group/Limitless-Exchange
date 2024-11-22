import { Box, Divider, HStack } from '@chakra-ui/react'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Marquee from 'react-fast-marquee'
import TextWithPixels from '@/components/common/text-with-pixels'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import { useThemeProvider } from '@/providers'
import BaseIcon from '@/resources/icons/base-icon-white.svg'
import DifferentTokensIcon from '@/resources/icons/different-tokens.svg'
import MarketsByCommunityIcon from '@/resources/icons/markets-by-community.svg'
import { ClickEvent, useAmplitude } from '@/services'
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
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <DifferentTokensIcon />
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <DifferentTokensIcon />
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <DifferentTokensIcon />
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <DifferentTokensIcon />
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <DifferentTokensIcon />
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <BaseIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Base network'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          {!isMobile && <MarketsByCommunityIcon />}
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <HStack marginX='6px' gap='4px' color='grey.50'>
          <DifferentTokensIcon />
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </HStack>
        <Divider orientation='vertical' color='grey.50' height='16px' />
      </Marquee>
    </Box>
  )
}
