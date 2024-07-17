import { Box, Divider, useTheme } from '@chakra-ui/react'
import TextWithPixels from '@/components/common/text-with-pixels'
import Marquee from 'react-fast-marquee'
import { useState } from 'react'

export default function HeaderMarquee() {
  const theme = useTheme()
  const [pauseMarquee, setPauseMarquee] = useState<boolean>(false)

  return (
    <Box onClick={() => setPauseMarquee(!pauseMarquee)}>
      <Marquee
        speed={pauseMarquee ? 0 : 50}
        style={{
          height: '20px',
          background: theme.colors.grey['800'],
          color: theme.colors.grey['50'],
          position: 'fixed',
          zIndex: 200,
        }}
      >
        <Box marginX='6px'>
          <TextWithPixels
            text='Transparent Voting'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Markets BY COMMUNITY'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Different tokens'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Transparent Voting'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Markets BY COMMUNITY'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Different tokens'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Transparent Voting'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Markets BY COMMUNITY'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Different tokens'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color={theme.colors.grey['50']} height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Transparent Voting'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Markets BY COMMUNITY'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Different tokens'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Transparent Voting'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Markets BY COMMUNITY'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Different tokens'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Transparent Voting'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Markets BY COMMUNITY'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
            highlightWord={3}
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
        <Box marginX='6px'>
          <TextWithPixels
            text='Different tokens'
            fontWeight={400}
            fontSize='12px'
            textTransform='uppercase'
          />
        </Box>
        <Divider orientation='vertical' color='grey.50' height='16px' />
      </Marquee>
    </Box>
  )
}
