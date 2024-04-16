import { borderRadius, colors } from '@/styles'
import { Box, HStack, Stack, StackProps, Text } from '@chakra-ui/react'
import { FaInfo } from 'react-icons/fa'

export const DepositDisclaimer = ({ ...props }: StackProps) => (
  <Stack
    h={'fit-content'}
    w={'full'}
    bg={'bgLight'}
    p={5}
    border={`1px solid ${colors.border}`}
    borderRadius={borderRadius}
    spacing={4}
    {...props}
  >
    <HStack w={'full'} alignItems={'start'}>
      <Box borderRadius={'full'} border={'1px solid grey'} mt={1}>
        <FaInfo fontSize={'9px'} fill='grey' />
      </Box>
      <Text color={'fontLight'}>
        Because ETH was deployed prior to the erc20 standard, it is not an erc20 token & needs to be
        “wrapped” in order to be traded with other tokens. When you deposit ETH into your smart
        account, it will be wrapped. If you already have some WETH, you can send it to your account
        address in the same way.
      </Text>
    </HStack>
  </Stack>
)
