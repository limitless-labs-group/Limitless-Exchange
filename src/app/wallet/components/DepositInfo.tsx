import { Avatar, HStack, Spacer, Text } from '@chakra-ui/react'

export default function DepositInfo() {
  return (
    <>
      <HStack w={'full'} spacing={4}>
        <Avatar name='1' size={'sm'} bg={'grey.100'} color={'font'} fontWeight={'bold'} />
        <Text>
          <b>Buy ETH (Base)</b> on Coinbase, Binance or any other exchange / fiat onramp that
          supports withdrawals on Base.
        </Text>
      </HStack>
      <Spacer h={'8px'} />

      <HStack w={'full'} spacing={4}>
        <Avatar name='2' size={'sm'} bg={'grey.100'} color={'font'} fontWeight={'bold'} />
        <Text>
          <b>Send it (Base)</b> to the address below & ensure to select Base as the network.
        </Text>
      </HStack>
    </>
  )
}
