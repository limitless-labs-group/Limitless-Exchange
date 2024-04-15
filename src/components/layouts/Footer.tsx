import { colors } from '@/styles'
import { Flex, HStack, Stack, Text, useMediaQuery } from '@chakra-ui/react'
import { FaCircle } from 'react-icons/fa'

const iPhone14Width = 430 //430px is the width of iPhone 14 Pro Max

export const Footer = () => {
  const [isLargerThan430] = useMediaQuery(`(min-width: ${iPhone14Width + 1}px)`)

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
              'https://www.notion.so/limitlesslabs/About-us-260f9f7ca5dc4403b55f7e0493485d09?pvs=4',
              '_blank'
            )
          }
        >
          About us
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://www.notion.so/limitlesslabs/Terms-of-Service-fd732c53ebc34e4aa36ad45b0b32595e?pvs=4',
              '_blank'
            )
          }
        >
          Terms
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://www.notion.so/limitlesslabs/Privacy-Policy-072f1a8cb75b452bb8541d1f53271ad9?pvs=4',
              '_blank'
            )
          }
        >
          Privacy
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://limitlesslabs.notion.site/Limitless-Creators-101-fbbde33a51104fcb83c57f6ce9d69d2a?pvs=4',
              '_blank'
            )
          }
        >
          Become a creator
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() =>
            window.open(
              'https://limitlesslabs.notion.site/FAQ-a911ea2f7ef24a8bbbaf7a5989f912ea?pvs=4',
              '_blank'
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
          onClick={() => window.open('https://discord.gg/rSJJrehEyH', '_blank')}
        >
          Discord
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() => window.open('https://twitter.com/trylimitless', '_blank')}
        >
          X
        </Text>
        <Text
          cursor={'pointer'}
          _hover={{ color: 'fontLight' }}
          onClick={() => window.open('https://warpcast.com/~/channel/limitless', '_blank')}
        >
          Warpcast
        </Text>
      </HStack>
    </Flex>
  )
}
