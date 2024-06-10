import { Flex, HStack, Stack, Text, useMediaQuery } from '@chakra-ui/react'
import { FaCircle } from 'react-icons/fa'

import { colors } from '@/styles'
import { IPHONE14_PRO_MAX_WIDTH } from '@/constants/devices'

export const Footer = () => {
  const [isLargerThan430] = useMediaQuery(`(min-width: ${IPHONE14_PRO_MAX_WIDTH + 1}px)`)

  return (
    <Flex
      w={'full'}
      // h={'44px'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flexDir={{ sm: 'column-reverse', md: 'row' }}
      gap={'10px'}
      fontSize={'sm'}
      borderTop={`1px solid ${colors.border}`}
      py={{ sm: 3, md: 2 }}
      px={{ sm: 4, md: 6 }}
    >
      {/* <Text>© 2024 Limitless Labs. All rights reserved</Text> */}
      <Stack
        divider={isLargerThan430 ? <FaCircle size='2px' /> : undefined}
        gap={3}
        flexWrap={'wrap'}
        align={'center'}
        direction={{ base: 'column', md: 'row' }}
      >
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://limitlesslabs.notion.site/About-us-260f9f7ca5dc4403b55f7e0493485d09',
              '_blank',
              'noopener'
            )
          }
        >
          About Us
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://drive.google.com/file/d/1RmObjk7_HBa-Tg6yiA45JSRxKcOSSdrW/view',
              '_blank',
              'noopener'
            )
          }
        >
          Terms of Service
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://drive.google.com/file/d/1HLB69C_X6ckuEzoX0GtGZo1cxXx-U_Eu/view',
              '_blank',
              'noopener'
            )
          }
        >
          Privacy Policy
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://limitlesslabs.notion.site/Limitless-Creators-101-fbbde33a51104fcb83c57f6ce9d69d2a?pvs=4',
              '_blank',
              'noopener'
            )
          }
        >
          Become a Creator
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://limitlesslabs.notion.site/FAQ-a911ea2f7ef24a8bbbaf7a5989f912ea?pvs=4',
              '_blank',
              'noopener'
            )
          }
        >
          FAQ
        </Text>
      </Stack>
      <HStack spacing={4} align='center'>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() => window.open('https://discord.gg/rSJJrehEyH', '_blank', 'noopener')}
        >
          Discord
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() => window.open('https://twitter.com/trylimitless', '_blank', 'noopener')}
        >
          X
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open('https://warpcast.com/~/channel/limitless', '_blank', 'noopener')
          }
        >
          Warpcast
        </Text>
      </HStack>
    </Flex>
  )
}
