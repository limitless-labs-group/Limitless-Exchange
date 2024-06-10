import { Button } from '@/components';
import { collateralTokensArray, defaultChain, higher, weth } from '@/constants';
import { useAccount, useBalanceService } from '@/services';
import { borderRadius, colors } from '@/styles';
import { HStack, Link, Stack, StackProps, Text } from '@chakra-ui/react';
import { useIsMobile } from '@/hooks';
import SelectTokenField from '@/components/common/SelectTokenField';
import { useState } from 'react';
import { Address } from 'viem';

export const DepositTestCard = ({ ...props }: StackProps) => {
  const { account } = useAccount();
  const { mint, isLoadingMint } = useBalanceService();
  const isMobile = useIsMobile();

  const [selectedToken, setSelectedToken] = useState<Address>(weth.address[defaultChain.id]);

  const tokenTitle = collateralTokensArray.find(
    (collToken) => collToken.address[defaultChain.id] === selectedToken,
  )?.symbol;

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={isMobile ? 0 : 5}
      border={isMobile ? 'unset' : `1px solid ${colors.border}`}
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
          Fund your Limitless account <b>{account}</b> with {defaultChain.name} <b>ETH</b>. It will be automatically
          wrapped into WETH. You can request some on{' '}
          <Link href='https://app.optimism.io/faucet' color={'brand'} isExternal>
            https://app.optimism.io/faucet
          </Link>
        </Text>
      </HStack>

      {/* <HStack w={'full'} spacing={4}>
        {defaultChain.testnet && (
          <Avatar name='2' size={'sm'} bg={'blue.50'} color={'font'} fontWeight={'bold'} />
        )} */}
      <SelectTokenField token={selectedToken} setToken={setSelectedToken} defaultValue={selectedToken} />
      <Button
        colorScheme={'brand'}
        w={{ sm: 'full', md: '150px' }}
        h={'40px'}
        onClick={() => {
          mint({
            address: selectedToken as Address,
            newToken: selectedToken !== weth.address[defaultChain.id],
          });
        }}
        isLoading={isLoadingMint}
      >
        Mint {tokenTitle}
      </Button>
      {/* </HStack> */}
    </Stack>
  );
};
