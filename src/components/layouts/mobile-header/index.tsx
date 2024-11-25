import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Skeleton,
  Slide,
  Spacer,
  StackItem,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { isAddress } from 'viem'
import { useAccount as useWagmiAccount } from 'wagmi'
import Avatar from '@/components/common/avatar'
import MobileDrawer from '@/components/common/drawer'
import Loader from '@/components/common/loader'
import { LoginButton } from '@/components/common/login-button'
import WrapModal from '@/components/common/modals/wrap-modal'
import SocialsFooter from '@/components/common/socials-footer'
import WalletPage from '@/components/layouts/wallet-page'
import '@/app/style.css'
import { Profile } from '@/components'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useThemeProvider } from '@/providers'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import MoonIcon from '@/resources/icons/moon-icon.svg'
import PortfolioIcon from '@/resources/icons/sidebar/Portfolio.svg'
import WalletIcon from '@/resources/icons/sidebar/Wallet.svg'
import SwapIcon from '@/resources/icons/sidebar/Wrap.svg'
import SunIcon from '@/resources/icons/sun-icon.svg'
import {
  ClickEvent,
  CreateMarketClickedMetadata,
  useAccount,
  useAmplitude,
  useBalanceService,
  useEtherspot,
  useHistory,
} from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'

export default function MobileHeader() {
  const { isConnected, isConnecting } = useWagmiAccount()
  const { overallBalanceUsd } = useBalanceService()
  const account = useWalletAddress()
  const { balanceInvested } = useHistory()
  const router = useRouter()
  const { disconnectFromPlatform, profileData, profileLoading, displayName } = useAccount()
  const { isLoadingSmartWalletAddress } = useEtherspot()
  const { trackClicked } = useAmplitude()
  const { client } = useWeb3Service()
  const { mode, setLightTheme, setDarkTheme } = useThemeProvider()

  const userMenuLoading = useMemo(() => {
    if (isConnecting) {
      return true
    }
    if (isConnected) {
      return profileData === undefined || profileLoading || isLoadingSmartWalletAddress
    }
    return false
  }, [isConnected, profileLoading, isLoadingSmartWalletAddress, isConnecting, profileData])

  const { isOpen: isOpenUserMenu, onToggle: onToggleUserMenu } = useDisclosure()

  const handleNavigateToPortfolioPage = () => {
    onToggleUserMenu()
    router.push('/portfolio')
  }

  const handleOpenWrapModal = () => {
    onToggleUserMenu()
  }

  return (
    <>
      <Box
        p='16px'
        pb='52px'
        w='100vw'
        bg='linear-gradient(180deg, #2E2E2E 0%, rgba(46, 46, 46, 0.00) 100%)'
      >
        <HStack justifyContent='space-between' alignItems='center'>
          <Box onClick={() => router.push('/')}>
            <Image
              src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
              height={32}
              width={156}
              alt='calendar'
            />
          </Box>
          <HStack gap='4px'>
            {isConnected ? (
              <>
                <Button
                  variant='transparent'
                  onClick={() => {
                    trackClicked(ClickEvent.ProfileBurgerMenuClicked, {
                      platform: 'mobile',
                    })

                    onToggleUserMenu()
                  }}
                >
                  <Text fontWeight={500} fontSize='16px'>
                    {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
                  </Text>
                  {userMenuLoading ? (
                    <Skeleton variant='common' w='24px' h='24px' />
                  ) : (
                    <Avatar account={account as string} avatarUrl={profileData?.pfpUrl} />
                  )}
                </Button>
                {isOpenUserMenu && (
                  <Box
                    position='fixed'
                    top={0}
                    left={0}
                    bottom={0}
                    w='full'
                    zIndex={100}
                    bg='rgba(0, 0, 0, 0.3)'
                    mt='20px'
                    animation='fadeIn 0.5s'
                  ></Box>
                )}
                <Slide
                  direction='right'
                  in={isOpenUserMenu}
                  style={{ zIndex: 100, marginTop: '20px', transition: '0.1s' }}
                  onClick={onToggleUserMenu}
                >
                  <VStack
                    ml='40px'
                    bg='grey.50'
                    h='full'
                    p='16px'
                    justifyContent='space-between'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box w='full'>
                      {userMenuLoading ? (
                        <Button h='24px' px='8px' w='full'>
                          <Loader />
                        </Button>
                      ) : (
                        <MobileDrawer
                          trigger={
                            <HStack
                              w='full'
                              gap='8px'
                              justifyContent='space-between'
                              onClick={() => {
                                onToggleUserMenu()
                              }}
                            >
                              <StackItem display='flex' justifyContent='center' alignItems='center'>
                                <Avatar
                                  account={account as string}
                                  avatarUrl={profileData?.pfpUrl}
                                />
                                <Box mx='4px' />
                                <Text {...paragraphMedium} className={'amp-mask'}>
                                  {isAddress(displayName || '')
                                    ? truncateEthAddress(displayName)
                                    : displayName}
                                </Text>
                              </StackItem>

                              <StackItem>
                                <Box color='grey.800'>
                                  <ArrowRightIcon width={16} height={16} />
                                </Box>
                              </StackItem>
                            </HStack>
                          }
                          variant='common'
                        >
                          <Profile isOpen={true} />
                        </MobileDrawer>
                      )}
                      <HStack
                        spacing={2}
                        my={'24px'}
                        wrap={'wrap'}
                        alignItems={'start'}
                        w={'full'}
                        overflowX='auto'
                      >
                        <ButtonGroup
                          variant='outline'
                          gap='2px'
                          p='2px'
                          bg='grey.100'
                          borderRadius='8px'
                          w='full'
                        >
                          <Button
                            key={uuidv4()}
                            variant={mode === 'dark' ? 'transparent' : 'black'}
                            onClick={setLightTheme}
                            w='full'
                          >
                            <SunIcon width={16} height={16} />
                          </Button>
                          <Button
                            key={uuidv4()}
                            variant={mode === 'dark' ? 'black' : 'transparent'}
                            onClick={setDarkTheme}
                            w='full'
                          >
                            <MoonIcon width={16} height={16} />
                          </Button>
                        </ButtonGroup>
                      </HStack>
                      <VStack my='24px' gap='8px'>
                        <Button
                          variant='transparent'
                          px={0}
                          w='full'
                          onClick={handleNavigateToPortfolioPage}
                        >
                          <HStack justifyContent='space-between' w='full'>
                            <HStack color='grey.500' gap='4px'>
                              <PortfolioIcon width={16} height={16} />
                              <Text fontWeight={500} fontSize='16px'>
                                Portfolio
                              </Text>
                            </HStack>

                            <HStack gap='8px'>
                              <Text fontWeight={500}>
                                {NumberUtil.formatThousands(balanceInvested, 2)} USD
                              </Text>
                              <Box color='grey.800'>
                                <ArrowRightIcon width={16} height={16} />
                              </Box>
                            </HStack>
                          </HStack>
                        </Button>

                        {client !== 'eoa' ? (
                          <MobileDrawer
                            trigger={
                              <Box
                                w='full'
                                mt='8px'
                                px={0}
                                onClick={() => {
                                  trackClicked(ClickEvent.ProfileBurgerMenuClicked, {
                                    option: 'Wallet',
                                    platform: 'mobile',
                                  })
                                  onToggleUserMenu()
                                }}
                              >
                                <HStack justifyContent='space-between' w='full'>
                                  <HStack color='grey.500' gap='4px'>
                                    <WalletIcon width={16} height={16} />
                                    <Text fontWeight={500} fontSize='16px'>
                                      Wallet
                                    </Text>
                                  </HStack>

                                  <HStack gap='8px'>
                                    <Text fontWeight={500} fontSize='16px'>
                                      {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
                                    </Text>
                                    <Box color='grey.800'>
                                      <ArrowRightIcon width={16} height={16} />
                                    </Box>
                                  </HStack>
                                </HStack>
                              </Box>
                            }
                            variant='common'
                          >
                            <WalletPage onClose={() => console.log('ok')} />
                          </MobileDrawer>
                        ) : (
                          <MobileDrawer
                            trigger={
                              <Button
                                variant='transparent'
                                px={0}
                                w='full'
                                onClick={handleOpenWrapModal}
                              >
                                <HStack justifyContent='space-between' w='full'>
                                  <HStack color='grey.500' gap='4px'>
                                    <SwapIcon width={16} height={16} />
                                    <Text fontWeight={500} fontSize='16px'>
                                      Wrap ETH
                                    </Text>
                                  </HStack>

                                  <Box color='grey.800'>
                                    <ArrowRightIcon width={16} height={16} />
                                  </Box>
                                </HStack>
                              </Button>
                            }
                            title='Wrap ETH'
                            variant='common'
                          >
                            <WrapModal onClose={() => console.log('ok')} />
                          </MobileDrawer>
                        )}
                      </VStack>

                      {client !== 'eoa' && (
                        <MobileDrawer
                          trigger={
                            <Button
                              variant='contained'
                              w='full'
                              h='32px'
                              onClick={() => {
                                trackClicked(ClickEvent.TopUpClicked, {
                                  platform: 'mobile',
                                })
                                onToggleUserMenu()
                              }}
                            >
                              Top Up
                            </Button>
                          }
                          variant='common'
                        >
                          <WalletPage onClose={() => console.log('ok')} />
                        </MobileDrawer>
                      )}
                      <Button
                        variant='grey'
                        w='full'
                        mt='24px'
                        h='32px'
                        onClick={() => {
                          trackClicked<CreateMarketClickedMetadata>(
                            ClickEvent.CreateMarketClicked,
                            {
                              page: 'Explore Markets',
                            }
                          )
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

                    <Spacer />

                    <Button
                      variant='grey'
                      w='full'
                      mt='24px'
                      h='32px'
                      onClick={() => {
                        trackClicked(ClickEvent.ProfileBurgerMenuClicked, {
                          option: 'Sign Out',
                          platform: 'mobile',
                        })
                        disconnectFromPlatform()
                      }}
                    >
                      Log Out
                    </Button>
                    <Divider mt={'12px'} />
                    <SocialsFooter />
                  </VStack>
                </Slide>
              </>
            ) : (
              <LoginButton />
            )}
          </HStack>
        </HStack>
      </Box>
    </>
  )
}
