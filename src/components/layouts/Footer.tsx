import { Flex, HStack, Switch, Text } from '@chakra-ui/react'

export const Footer = () => (
  <Flex
    w={'full'}
    justifyContent={'space-between'}
    alignItems={'center'}
    flexDir={{ sm: 'column-reverse', md: 'row' }}
    gap={'10px'}
    fontSize={'sm'}
    color={'fontLight'}
    py={{ sm: '16px', md: '20px' }}
    px={{ sm: '16px', md: '24px' }}
  >
    <Text>© 2024 Limitless Labs. All rights reserved</Text>
    {/* <HStack>
      <Text>Trade</Text>
      <Switch isDisabled />
      <Text>Create</Text>
    </HStack> */}
  </Flex>
)
