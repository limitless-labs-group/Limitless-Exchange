import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Slide,
  Spacer,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useFundWallet } from '@privy-io/react-auth'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { isAddress } from 'viem'
import Avatar from '@/components/common/avatar'
import MobileDrawer from '@/components/common/drawer'
import Loader from '@/components/common/loader'
import { LoginButton } from '@/components/common/login-button'
import WrapModal from '@/components/common/modals/wrap-modal'
import Skeleton from '@/components/common/skeleton'
import SocialsFooter from '@/components/common/socials-footer'
import UpgradeWalletContainer from '@/components/common/upgrade-wallet-container'
import WalletPage from '@/components/layouts/wallet-page'
import '@/app/style.css'
import { Profile } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import useClient from '@/hooks/use-client'
import { usePriceOracle, useThemeProvider } from '@/providers'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import MoonIcon from '@/resources/icons/moon-icon.svg'
import PortfolioIcon from '@/resources/icons/sidebar/Portfolio.svg'
import WalletIcon from '@/resources/icons/sidebar/Wallet.svg'
import SwapIcon from '@/resources/icons/sidebar/Wrap.svg'
import SunIcon from '@/resources/icons/sun-icon.svg'
import {
  ClickEvent,
  ClobPositionWithType,
  HistoryPositionWithType,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  useBalanceQuery,
  useBalanceService,
  useLimitlessApi,
  usePosition,
} from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'

export default function MobileHeader() {
  const { overallBalanceUsd } = useBalanceService()
  const { data: positions } = usePosition()
  const { supportedTokens } = useLimitlessApi()
  const { convertAssetAmountToUsd } = usePriceOracle()
  const router = useRouter()
  const {
    disconnectFromPlatform,
    profileData,
    profileLoading,
    displayName,
    account,
    loginToPlatform,
  } = useAccount()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { trackClicked } = useAmplitude()
  const { client } = useWeb3Service()
  const { isLogged } = useClient()
  const { mode, setLightTheme, setDarkTheme } = useThemeProvider()
  const { fundWallet } = useFundWallet()

  const { isOpen: isOpenUserMenu, onToggle: onToggleUserMenu } = useDisclosure()
  const { handleCategory } = useTokenFilter()

  // Todo move this and other duplicated to a proper service
  const balanceInvested = useMemo(() => {
    const ammPositions = positions?.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceInvested = 0
    ammPositions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateral?.symbol
      )
      if (!!token) {
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, position.collateralAmount)
      }
      _balanceInvested += positionUsdAmount
    })
    return NumberUtil.toFixed(_balanceInvested, 2)
  }, [positions])

  const handleNavigateToPortfolioPage = () => {
    onToggleUserMenu()
    router.push('/portfolio')
  }

  const handleOpenWrapModal = () => {
    onToggleUserMenu()
  }

  const handleNavigateToCreateMarketPage = () => {
    onToggleUserMenu()
    router.push('/create-market')
  }

  const handleBuyCryptoClicked = async () => {
    trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.BuyCryptoClicked)
    await fundWallet(account as string)
  }

  return (
    <>
      <Box
        p='16px'
        w='100vw'
        bg={`linear-gradient(180deg, var(--chakra-colors-grey-50) 0%, ${
          mode === 'light' ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0)'
        }  100%)`}
        marginTop='20px'
      >
        <HStack justifyContent='space-between' alignItems='center'>
          <Box
            onClick={() => {
              handleCategory(undefined)
              router.push('/')
            }}
          >
            <HStack w='full' alignItems='center'>
              <Image
                src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
                height={32}
                width={156}
                alt='calendar'
              />
            </HStack>
          </Box>
          <HStack gap='4px'>
            {isLogged ? (
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
                  {!balanceOfSmartWallet ? (
                    <Box w='100px'>
                      <Skeleton height={24} />
                    </Box>
                  ) : (
                    <Text fontWeight={500} fontSize='16px'>
                      {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
                    </Text>
                  )}
                  {profileLoading ? (
                    <Box w='24px'>
                      <Skeleton height={24} />
                    </Box>
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
                      {profileLoading ? (
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
                              <HStack gap='4px'>
                                <Avatar
                                  account={account as string}
                                  avatarUrl={profileData?.pfpUrl}
                                />
                                <Text {...paragraphMedium} className={'amp-mask'}>
                                  {isAddress(displayName || '')
                                    ? truncateEthAddress(displayName)
                                    : displayName}
                                </Text>
                              </HStack>

                              <Box color='grey.800'>
                                <ArrowRightIcon width={16} height={16} />
                              </Box>
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
                          px='4px'
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
                          <>
                            <UpgradeWalletContainer>
                              <MobileDrawer
                                trigger={
                                  <Box
                                    w='full'
                                    mt='8px'
                                    px='4px'
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
                            </UpgradeWalletContainer>
                            <Button
                              variant='contained'
                              onClick={handleBuyCryptoClicked}
                              w='full'
                              mt='12px'
                              // bg={isOpenWalletPage ? 'grey.100' : 'unset'}
                            >
                              Deposit
                            </Button>
                          </>
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
                        {/*<Button*/}
                        {/*  variant='transparent'*/}
                        {/*  px={0}*/}
                        {/*  w='full'*/}
                        {/*  onClick={handleNavigateToCreateMarketPage}*/}
                        {/*>*/}
                        {/*  <HStack justifyContent='space-between' w='full'>*/}
                        {/*    <HStack color='grey.500' gap='4px'>*/}
                        {/*      <SquarePlusIcon width={16} height={16} />*/}
                        {/*      <Text fontWeight={500} fontSize='16px'>*/}
                        {/*        Create Market*/}
                        {/*      </Text>*/}
                        {/*    </HStack>*/}

                        {/*    <HStack gap='8px'>*/}
                        {/*      <Box color='grey.800'>*/}
                        {/*        <ArrowRightIcon width={16} height={16} />*/}
                        {/*      </Box>*/}
                        {/*    </HStack>*/}
                        {/*  </HStack>*/}
                        {/*</Button>*/}
                        {/*<MobileDrawer*/}
                        {/*  trigger={*/}
                        {/*    <Button*/}
                        {/*      variant='transparent'*/}
                        {/*      px={0}*/}
                        {/*      onClick={() => {*/}
                        {/*        trackClicked<ProfileBurgerMenuClickedMetadata>(*/}
                        {/*          ClickEvent.ProfileBurgerMenuClicked,*/}
                        {/*          {*/}
                        {/*            option: 'My Markets',*/}
                        {/*          }*/}
                        {/*        )*/}
                        {/*      }}*/}
                        {/*      w='full'*/}
                        {/*    >*/}
                        {/*      <HStack w='full'>*/}
                        {/*        <HStack justifyContent='space-between' w='full'>*/}
                        {/*          <HStack color='grey.500' gap='4px'>*/}
                        {/*            <MyMarketsIcon width={16} height={16} />*/}
                        {/*            <Text fontWeight={500} fontSize='16px'>*/}
                        {/*              My Markets*/}
                        {/*            </Text>*/}
                        {/*          </HStack>*/}

                        {/*          <HStack gap='8px'>*/}
                        {/*            <Box color='grey.800'>*/}
                        {/*              <ArrowRightIcon width={16} height={16} />*/}
                        {/*            </Box>*/}
                        {/*          </HStack>*/}
                        {/*        </HStack>*/}
                        {/*      </HStack>*/}
                        {/*    </Button>*/}
                        {/*  }*/}
                        {/*  variant='common'*/}
                        {/*>*/}
                        {/*  <MyMarkets />*/}
                        {/*</MobileDrawer>*/}
                      </VStack>
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
              <LoginButton login={loginToPlatform} />
            )}
          </HStack>
        </HStack>
      </Box>
    </>
  )
}
