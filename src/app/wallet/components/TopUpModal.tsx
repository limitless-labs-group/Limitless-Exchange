import { Button, IModal, Modal } from '@/components';
import { Dispatch, SetStateAction, useMemo } from 'react';
import DepositInfo from '@/app/wallet/components/DepositInfo';
import { CopyEvent, useAccount, useAmplitude } from '@/services';
import { Box, HStack, Text, useClipboard } from '@chakra-ui/react';
import { truncateEthAddress } from '@/utils';
import SelectTokenField from '@/components/common/SelectTokenField';
import { collateralTokensArray, defaultChain, weth } from '@/constants';
import { Address } from 'viem';

type TopUpModalProps = Omit<IModal, 'children'> & {
  selectedToken: Address;
  setSelectedToken: Dispatch<SetStateAction<Address>>;
};

export default function TopUpModal({ isOpen, onClose, selectedToken, setSelectedToken, ...props }: TopUpModalProps) {
  const { trackCopied } = useAmplitude();
  const { account } = useAccount();
  const { onCopy, hasCopied } = useClipboard(account ?? '');

  const tokenName = useMemo(() => {
    return (
      collateralTokensArray.find((collateralToken) => collateralToken.address[defaultChain.id] === selectedToken)
        ?.symbol || '$HIGHER'
    );
  }, [selectedToken]);

  return (
    <Modal
      size={'md'}
      title={`Deposit ${tokenName} (Base)`}
      isOpen={isOpen}
      onClose={onClose}
      {...props}
      isCentered={false}
      maxW='746px'
    >
      <DepositInfo />
      <HStack my='30px' gap={'14px'}>
        <Box
          w={'calc(100% - 115px)'}
          justifyContent={'start'}
          color={'grey.700'}
          bg='grey.200'
          px='10px'
          py='14px'
          fontSize='16px'
          rounded='3px'
          fontWeight={'normal'}
          onClick={() => {
            onCopy();
            trackCopied(CopyEvent.WalletAddressCopied, {
              page: 'Deposit',
            });
          }}
        >
          <Text display={{ sm: 'none', md: 'contents' }}>{account}</Text>
          <Text display={{ sm: 'contents', md: 'none' }}>{truncateEthAddress(account)}</Text>
        </Box>
        <Button colorScheme={'brand'} w={'100px'} onClick={onCopy} h='52px'>
          {hasCopied ? 'Copied!' : 'Copy'}
        </Button>
      </HStack>
      <SelectTokenField
        token={selectedToken ? selectedToken : weth.address[defaultChain.id]}
        setToken={setSelectedToken}
        defaultValue={selectedToken ? selectedToken : weth.address[defaultChain.id]}
      />
    </Modal>
  );
}
