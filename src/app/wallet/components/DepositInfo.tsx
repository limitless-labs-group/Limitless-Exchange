import { Avatar, HStack, Link, Spacer, Text } from '@chakra-ui/react'

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
      <Text mt={'12px'}>
        Power user? Try our multi tokens feature by buying{' '}
        <Link
          href='https://app.uniswap.org/swap?outputCurrency=0xFeF2D7B013b88FEc2BFe4D2FEE0AEb719af73481&chain=base'
          isExternal
          color='brand'
        >
          /onchain on Uniswap
        </Link>{' '}
        & depositing it to your smart wallet in the same way as above.
      </Text>
    </>
  )
}
