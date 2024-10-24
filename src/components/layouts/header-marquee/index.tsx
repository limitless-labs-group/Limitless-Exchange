import { Box, Divider } from '@chakra-ui/react'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Marquee from 'react-fast-marquee'
import TextWithPixels from '@/components/common/text-with-pixels'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import { useThemeProvider } from '@/providers'
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
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Transparent Voting'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Transparent Voting'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Transparent Voting'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Transparent Voting'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Transparent Voting'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Transparent Voting'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Markets BY COMMUNITY'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text={isMobile ? `Total Trading Volume: ${volume}` : 'Different tokens'}
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            color='grey.50'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
      </Marquee>
    </Box>
  )
}
