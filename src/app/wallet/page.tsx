'use client';

import { BalanceCard, DepositTestCard, WithdrawModal } from '@/app/wallet/components';
import { Button, MainLayout } from '@/components';
import { defaultChain, weth } from '@/constants';
import { OpenEvent, useAmplitude, useAuth } from '@/services';
import { colors } from '@/styles';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaCircle, FaComments } from 'react-icons/fa';
import AssetsTable from '@/app/wallet/components/AssetsTable';
import Paper from '@/components/common/Paper';
import DepositInfo from '@/app/wallet/components/DepositInfo';
import TopUpModal from '@/app/wallet/components/TopUpModal';
import { useIsMobile } from '@/hooks';
import { Address } from 'viem';

const WalletPage = () => {
  const { signIn: signInWithW3A, isLoggedIn } = useAuth();
  const { trackOpened } = useAmplitude();
  const isMobile = useIsMobile();

  const [selectedToken, setSelectedToken] = useState<Address>(weth.address[defaultChain.id]);

  useEffect(() => {
    if (!isLoggedIn) {
      signInWithW3A();
    }

    trackOpened(OpenEvent.PageOpened, {
      page: 'Deposit Page',
    });
  }, []);

  const { isOpen: isOpenTopup, onOpen: onOpenTopUp, onClose: onCloseTopUp } = useDisclosure();
  const { isOpen: isWithdrawOpen, onOpen: onOpenWithdraw, onClose: onCloseWithdraw } = useDisclosure();

  const handleOpenTopUpModal = (token: Address) => {
    setSelectedToken(token);
    onOpenTopUp();
  };

  const handleCloseTopUpModal = () => {
    setSelectedToken(weth.address[defaultChain.id]);
    onCloseTopUp();
  };

  const handleOpenWithdrawModal = () => {
    onOpenWithdraw();
  };

  const handleCloseWithdrawModal = () => {
    setSelectedToken(weth.address[defaultChain.id]);
    onCloseWithdraw();
  };

  return (
    <MainLayout maxContentWidth={'796px'}>
      <BalanceCard handleOpenTopUpModal={handleOpenTopUpModal} handleOpenWithdrawModal={handleOpenWithdrawModal} />
      <AssetsTable handleOpenTopUpModal={handleOpenTopUpModal} />
      {/*{defaultChain.testnet && <DepositTestCard />}*/}
      <Paper>
        <Text fontSize={{ md: '20px' }}>FAQ</Text>
        <Accordion allowMultiple mt='16px'>
          <AccordionItem borderWidth={0}>
            <h2>
              <AccordionButton justifyContent='space-between' py={4} px={isMobile ? 0 : '16px'}>
                <Text fontWeight={'semibold'} fontSize={'14px'}>
                  How to deposit my balance?
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} px={{ md: 2 }}>
              <DepositInfo />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton justifyContent='space-between' py={4} px={isMobile ? 0 : '16px'}>
                <Text fontWeight={'semibold'} fontSize={'14px'}>
                  I don’t know where to find WETH
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} px={{ md: 2 }}>
              Because ETH was deployed prior to the erc20 standard, it is not an erc20 token & needs to be “wrapped” in
              order to be traded with other tokens. When you deposit ETH into your smart account, it will be wrapped. If
              you already have some WETH, you can send it to your account address in the same way.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton justifyContent='space-between' py={4} px={isMobile ? 0 : '16px'}>
                <Text fontWeight={'semibold'} fontSize={'14px'}>
                  How can I talk to support?
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} px={{ md: 2 }}>
              <Button
                colorScheme={'transparent'}
                border={`1px solid ${colors.border}`}
                leftIcon={<FaComments size={'18px'} />}
                rightIcon={<FaCircle fill='green' size={'8px'} />}
                onClick={() => window.open('https://discord.gg/rSJJrehEyH', '_blank', 'noopener')}
              >
                Talk to human
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Paper>
      <TopUpModal
        isOpen={isOpenTopup}
        onClose={handleCloseTopUpModal}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={handleCloseWithdrawModal}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />
    </MainLayout>
  );
};

export default WalletPage;
