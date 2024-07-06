import { Box, Divider, useTheme } from '@chakra-ui/react'
import TextWithPixels from 'src/components/common-new/text-with-pixels'
import Marquee from 'react-fast-marquee'

export default function HeaderMarquee() {
  const theme = useTheme()
  return (
    <Marquee
      style={{
        height: '20px',
        background: theme.colors.black,
        color: theme.colors.white,
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
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Markets BY COMMUNITY'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
          highlightWord={3}
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Different tokens'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Transparent Voting'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Markets BY COMMUNITY'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
          highlightWord={3}
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Different tokens'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Transparent Voting'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Markets BY COMMUNITY'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
          highlightWord={3}
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Different tokens'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Transparent Voting'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Markets BY COMMUNITY'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
          highlightWord={3}
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Different tokens'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Transparent Voting'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Markets BY COMMUNITY'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
          highlightWord={3}
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Different tokens'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Transparent Voting'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Markets BY COMMUNITY'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
          highlightWord={3}
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
      <Box marginX='6px'>
        <TextWithPixels
          text='Different tokens'
          fontWeight={400}
          fontSize='12px'
          textTransform='uppercase'
        />
      </Box>
      <Divider orientation='vertical' color={theme.colors.white} height='16px' />
    </Marquee>
  )
}
