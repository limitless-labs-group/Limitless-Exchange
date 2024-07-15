import {
  Divider,
  useTheme,
  VStack,
  Text,
  Button,
  HStack,
  Image as ChakraImage,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  useDisclosure,
  Slide,
  Box,
} from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'

import {
  ClickEvent,
  CreateMarketClickedMetadata,
  useAmplitude,
  useBalanceService,
  useHistory,
  useAccount,
  ProfileBurgerMenuClickedMetadata,
  useAuth,
} from '@/services'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { cutUsername } from '@/utils/string'
import { useRouter } from 'next/navigation'
import WalletPage from '@/components/layouts/wallet-page'
import TokenFilter from '@/components/common/token-filter'
import { useWeb3Service } from '@/services/Web3Service'
import { LogInButton } from '@/components/common/login-button'

export default function Sidebar() {
  const theme = useTheme()

  const { isConnected } = useWagmiAccount()
  const { trackClicked } = useAmplitude()

  const { overallBalanceUsd } = useBalanceService()
  const { balanceInvested } = useHistory()
  const { userInfo } = useAccount()
  const address = useWalletAddress()
  const router = useRouter()
  const { signOut } = useAuth()
  const { client } = useWeb3Service()

  const { isOpen: isOpenWalletPage, onToggle: onToggleWalletPage } = useDisclosure()

  const handleOpenWalletPage = () => {
    if (client !== 'eoa') {
      onToggleWalletPage()
    }
  }

  return (
    <>
      <VStack
        padding='16px'
        borderRight={`1px solid ${theme.colors.grey['200']}`}
        h='full'
        minW={'188px'}
        minH={'100vh'}
        zIndex={200}
        bg={isOpenWalletPage ? 'grey.100' : 'grey.50'}
      >
        <Button variant='transparent' onClick={() => router.push('/')}>
          <Image src={'/logo-black.svg'} height={32} width={156} alt='calendar' />
        </Button>
        {isConnected && (
          <VStack my='16px' w='full' gap='8px'>
            {client !== 'eoa' && (
              <Button variant='transparent' onClick={handleOpenWalletPage} w='full'>
                <HStack w='full'>
                  <WalletIcon width={16} height={16} />
                  <Text fontWeight={500} fontSize='14px'>
                    {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
                  </Text>
                </HStack>
              </Button>
            )}
            <Button variant='transparent' onClick={() => router.push('/portfolio')} w='full'>
              <HStack w='full'>
                <PortfolioIcon width={16} height={16} />
                <Text fontWeight={500} fontSize='14px'>
                  {NumberUtil.formatThousands(balanceInvested, 2)} USD
                </Text>
              </HStack>
            </Button>
            <Accordion allowToggle>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <HStack gap='8px'>
                      {userInfo?.profileImage?.includes('http') ? (
                        <ChakraImage
                          src={userInfo.profileImage}
                          borderRadius={'2px'}
                          h={'16px'}
                          w={'16px'}
                        />
                      ) : (
                        <Flex
                          borderRadius={'2px'}
                          h={'16px'}
                          w={'16px'}
                          bg='grey.300'
                          alignItems='center'
                          justifyContent='center'
                        >
                          <Text fontWeight={500}>{userInfo?.name?.[0].toUpperCase()}</Text>
                        </Flex>
                      )}
                      <Text fontWeight={500}>
                        {userInfo?.name ? cutUsername(userInfo.name) : truncateEthAddress(address)}
                      </Text>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel p={0}>
                  <Button
                    variant='grey'
                    w='full'
                    mt='8px'
                    onClick={() => {
                      trackClicked<ProfileBurgerMenuClickedMetadata>(
                        ClickEvent.ProfileBurgerMenuClicked,
                        {
                          option: 'Sign Out',
                        }
                      )
                      signOut()
                    }}
                  >
                    Log Out
                  </Button>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        )}
        {isConnected ? (
          <Button
            variant='grey'
            w='full'
            onClick={() => {
              trackClicked<CreateMarketClickedMetadata>(ClickEvent.CreateMarketClicked, {
                page: 'Explore Markets',
              })
              window.open(
                'https://limitlesslabs.notion.site/Limitless-Creators-101-fbbde33a51104fcb83c57f6ce9d69d2a?pvs=4',
                '_blank',
                'noopener'
              )
            }}
          >
            Create Market
          </Button>
        ) : (
          <LogInButton />
        )}
        <Divider />
        <TokenFilter />
      </VStack>
      {isOpenWalletPage && (
        <Box
          position='fixed'
          top={0}
          left={0}
          bottom={0}
          w='full'
          zIndex={100}
          bg='rgba(0, 0, 0, 0.3)'
          mt='20px'
          ml='188px'
          transition='background-color 0.5s'
        ></Box>
      )}
      <Slide
        direction='left'
        in={isOpenWalletPage}
        style={{
          zIndex: 100,
          marginTop: '20px',
          marginLeft: '188px',
          transition: '0.1s',
        }}
        onClick={onToggleWalletPage}
      >
        <WalletPage onClose={onToggleWalletPage} />
      </Slide>
    </>
  )
}
