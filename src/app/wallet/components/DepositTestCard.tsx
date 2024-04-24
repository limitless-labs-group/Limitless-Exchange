import { Button } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useAccount, useBalanceService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { HStack, Link, Stack, StackProps, Text } from '@chakra-ui/react'

export const DepositTestCard = ({ ...props }: StackProps) => {
  const { account } = useAccount()
  const { mint, isLoadingMint } = useBalanceService()

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={5}
      border={`1px solid ${colors.border}`}
      //   boxShadow={'0 0 8px #ddd'}
      borderRadius={borderRadius}
      spacing={4}
      {...props}
    >
      <HStack
        fontSize={'11px'}
        fontWeight={'bold'}
        color={'fontLight'}
        textTransform={'uppercase'}
        letterSpacing={'0.15em'}
      >
        <Text color={'white'} bg={'black'} p={'2px 8px'} borderRadius={'3px'} fontSize={'9px'}>
          TEST METHOD
        </Text>
      </HStack>
      {/* <HStack w={'full'}>
        <Heading fontSize={'24px'}>Mint mock {collateralToken.symbol}</Heading>
      </HStack> */}

      <HStack w={'full'} spacing={4}>
        {/* <Avatar name='1' size={'sm'} bg={'blue.50'} color={'font'} fontWeight={'bold'} /> */}
        <Text wordBreak={'break-word'}>
          Fund your Limitless account <b>{account}</b> with {defaultChain.name} <b>ETH</b>. It will
          be automatically wrapped into WETH. You can request some on{' '}
          <Link href='https://app.optimism.io/faucet' color={'brand'} isExternal>
            https://app.optimism.io/faucet
          </Link>
        </Text>
      </HStack>

      {/* <HStack w={'full'} spacing={4}>
        {defaultChain.testnet && (
          <Avatar name='2' size={'sm'} bg={'blue.50'} color={'font'} fontWeight={'bold'} />
        )} */}
      <Button
        colorScheme={'brand'}
        w={{ sm: 'full', md: '150px' }}
        h={'40px'}
        onClick={() => {
          mint()
        }}
        isLoading={isLoadingMint}
      >
        Mint {collateralToken.symbol}
      </Button>
      {/* </HStack> */}
    </Stack>
  )
}
