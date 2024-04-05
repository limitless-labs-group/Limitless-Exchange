import { colors } from '@/styles'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { FaCircle } from 'react-icons/fa'

export const Footer = () => (
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
    <HStack divider={<FaCircle size={'2px'} />} gap={3} flexWrap={'wrap'} justifyContent={'center'}>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        About
      </Text>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        Terms
      </Text>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        Privacy
      </Text>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        Become a creator
      </Text>
    </HStack>
    <HStack spacing={4}>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        Discord
      </Text>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        X
      </Text>
      <Text cursor={'pointer'} _hover={{ color: 'fontLight' }}>
        Warpcast
      </Text>
    </HStack>
  </Flex>
)
