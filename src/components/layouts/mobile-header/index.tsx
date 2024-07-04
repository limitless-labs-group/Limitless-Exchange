import Image from 'next/image'
import {
  Button,
  Flex,
  HStack,
  Text,
  Image as ChakraImage,
  useDisclosure,
  Slide,
  Box,
  VStack,
} from '@chakra-ui/react'
import { NumberUtil } from '@/utils'
import { LogInButton } from '@/components'
import React from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import {
  ClickEvent,
  CreateMarketClickedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  useAuth,
  useBalanceService,
  useHistory,
} from '@/services'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import { useRouter } from 'next/navigation'

export default function MobileHeader() {
  const { isConnected } = useWagmiAccount()
  const { overallBalanceUsd } = useBalanceService()
  const { userInfo } = useAccount()
  const address = useWalletAddress()
  const { balanceInvested } = useHistory()
  const router = useRouter()
  const { signOut } = useAuth()
  const { trackClicked } = useAmplitude()

  const { isOpen: isOpenUserMenu, onToggle: onToggleUserMenu } = useDisclosure()

  const handleNavigateToPortfolioPage = () => {
    onToggleUserMenu()
    router.push('/portfolio')
  }

  return (
    <HStack p='16px' justifyContent='space-between'>
      <Button variant='transparent' onClick={() => router.push('/')}>
        <Image src={'/logo-black.svg'} height={32} width={156} alt='calendar' />
      </Button>
      <HStack gap='4px'>
        {isConnected ? (
          <>
            <Button variant='transparent' onClick={onToggleUserMenu}>
              <Text fontWeight={500} fontSize='16px'>
                {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
              </Text>
              {userInfo?.profileImage?.includes('http') ? (
                <ChakraImage
                  src={userInfo.profileImage}
                  borderRadius={'2px'}
                  h={'32px'}
                  w={'32px'}
                />
              ) : (
                <Flex
                  borderRadius={'2px'}
                  h={'32px'}
                  w={'32px'}
                  bg='grey.300'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Text fontWeight={500} fontSize='24px'>
                    {userInfo?.name?.[0].toUpperCase()}
                  </Text>
                </Flex>
              )}
            </Button>
            <Slide
              direction='right'
              in={isOpenUserMenu}
              style={{ zIndex: 100, background: 'rgba(0, 0, 0, 0.3)', marginTop: '20px' }}
              onClick={onToggleUserMenu}
            >
              <VStack ml='40px' bg='white' h='full' p='16px' justifyContent='space-between'>
                <Box w='full'>
                  <HStack gap='8px'>
                    {userInfo?.profileImage?.includes('http') ? (
                      <ChakraImage
                        src={userInfo.profileImage}
                        borderRadius={'2px'}
                        h={'24px'}
                        w={'24px'}
                      />
                    ) : (
                      <Flex
                        borderRadius={'2px'}
                        h={'24px'}
                        w={'24px'}
                        bg='grey.300'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Text fontWeight={500} fontSize='18px'>
                          {userInfo?.name?.[0].toUpperCase()}
                        </Text>
                      </Flex>
                    )}
                    <Text fontSize='16px' fontWeight={500}>
                      {userInfo?.name ? userInfo.name : address}
                    </Text>
                  </HStack>
                  <VStack my='24px'>
                    <Button variant='transparent' w='full' onClick={handleNavigateToPortfolioPage}>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack color='grey.500' gap='4px'>
                          <PortfolioIcon width={16} height={16} />
                          <Text fontWeight={500} fontSize='16px'>
                            Portfolio
                          </Text>
                        </HStack>

                        <HStack gap='4px'>
                          <Text fontWeight={500}>
                            {NumberUtil.formatThousands(balanceInvested, 2)} USD
                          </Text>
                          <Box transform='rotate(270deg)' color='grey.500'>
                            <ChevronDownIcon width={16} height={16} />
                          </Box>
                        </HStack>
                      </HStack>
                    </Button>
                    <Button variant='transparent' w='full' mt='8px'>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack color='grey.500' gap='4px'>
                          <WalletIcon width={16} height={16} />
                          <Text fontWeight={500} fontSize='16px'>
                            Wallet
                          </Text>
                        </HStack>

                        <HStack gap='4px'>
                          <Text fontWeight={500}>
                            {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
                          </Text>
                          <Box transform='rotate(270deg)' color='grey.500'>
                            <ChevronDownIcon width={16} height={16} />
                          </Box>
                        </HStack>
                      </HStack>
                    </Button>
                  </VStack>
                  <Button variant='contained' w='full' h='32px'>
                    Top Up
                  </Button>
                  <Button
                    variant='grey'
                    w='full'
                    mt='24px'
                    h='32px'
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
                </Box>
                <Button
                  variant='grey'
                  w='full'
                  mt='24px'
                  h='32px'
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
              </VStack>
            </Slide>
          </>
        ) : (
          <LogInButton />
        )}
      </HStack>
    </HStack>
  )
}