import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  Slide,
  Spacer,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useFundWallet, usePrivy } from '@privy-io/react-auth'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { formatUnits, isAddress } from 'viem'
import Avatar from '@/components/common/avatar'
import MobileDrawer from '@/components/common/drawer'
import Loader from '@/components/common/loader'
import { LoginButtons } from '@/components/common/login-button'
import WrapModal from '@/components/common/modals/wrap-modal'
import Skeleton from '@/components/common/skeleton'
import SocialsFooter from '@/components/common/socials-footer'
import InviteFriendsPage from '@/components/layouts/invite-friends-page'
import ThemeSwitcher from '@/components/layouts/theme-switcher'
import WalletPage from '@/components/layouts/wallet-page'
import '@/app/style.css'
import { Profile } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import useClient from '@/hooks/use-client'
import { usePriceOracle, useThemeProvider } from '@/providers'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import HeartIcon from '@/resources/icons/heart-icon.svg'
import KeyIcon from '@/resources/icons/key-icon.svg'
import MenuIcon from '@/resources/icons/menu-icon.svg'
import MoonIcon from '@/resources/icons/moon-icon.svg'
import SearchIcon from '@/resources/icons/search.svg'
import PortfolioIcon from '@/resources/icons/sidebar/Portfolio.svg'
import WalletIcon from '@/resources/icons/sidebar/Wallet.svg'
import SwapIcon from '@/resources/icons/sidebar/Wrap.svg'
import SunIcon from '@/resources/icons/sun-icon.svg'
import Dots from '@/resources/icons/three-horizontal-dots.svg'
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
  const [refCopied, setRefCopied] = useState(false)
  const { exportWallet } = usePrivy()
  const router = useRouter()
  const {
    disconnectFromPlatform,
    profileData,
    profileLoading,
    displayName,
    account,
    loginToPlatform,
    referralData,
  } = useAccount()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { trackClicked } = useAmplitude()
  const { client } = useWeb3Service()
  const { isLoggedToPlatform } = useClient()
  const { mode, setLightTheme, setDarkTheme } = useThemeProvider()
  const { fundWallet } = useFundWallet()

  const {
    isOpen: isOpenUserMenu,
    onOpen: onOpenUserMenu,
    onClose: onCloseUserMenu,
  } = useDisclosure()
  const { handleDashboard, handleCategory } = useTokenFilter()

  useEffect(() => {
    let hideRefCopiedMessage: NodeJS.Timeout | undefined

    if (refCopied) {
      hideRefCopiedMessage = setTimeout(() => {
        setRefCopied(false)
      }, 2000)
    }
    return () => {
      if (hideRefCopiedMessage) {
        clearTimeout(hideRefCopiedMessage)
      }
    }
  }, [refCopied])

  const balanceInvested = useMemo(() => {
    const ammPositions = positions?.positions.filter(
      (position) => position.type === 'amm'
    ) as HistoryPositionWithType[]
    const clobPositions = positions?.positions.filter(
      (position) => position.type === 'clob'
    ) as ClobPositionWithType[]
    let _balanceInvested = 0
    ammPositions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateralToken?.symbol
      )
      if (token) {
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, position.collateralAmount)
      }
      _balanceInvested += positionUsdAmount
    })
    clobPositions?.forEach((position) => {
      let positionUsdAmount = 0
      const token = supportedTokens?.find(
        (token) => token.symbol === position.market.collateralToken.symbol
      )
      if (token) {
        const investedAmount = new BigNumber(position.positions.yes.cost)
          .plus(new BigNumber(position.positions.no.cost))
          .toString()
        const formattedInvestedAmount = formatUnits(
          BigInt(investedAmount),
          position.market.collateralToken.decimals
        )
        positionUsdAmount = convertAssetAmountToUsd(token.priceOracleId, formattedInvestedAmount)
        _balanceInvested += positionUsdAmount
      }
    })
    return NumberUtil.toFixed(_balanceInvested, 2)
  }, [positions])

  const handleNavigateToPortfolioPage = () => {
    onCloseUserMenu()
    router.push('/portfolio')
  }

  const handleOpenWrapModal = () => {
    trackClicked(ClickEvent.WrapETHClicked)
    onCloseUserMenu()
  }

  const handleNavigateToCreateMarketPage = () => {
    onCloseUserMenu()
    router.push('/create-market')
  }

  const handleBuyCryptoClicked = async () => {
    trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.BuyCryptoClicked)
    await fundWallet(account as string)
  }

  const handleUserMenuClicked = () => {
    onOpenUserMenu()
    if (!isOpenUserMenu) {
      trackClicked(ClickEvent.ProfileBurgerMenuClicked, {
        platform: 'mobile',
      })
    }
  }

  const handleInviteFriendsClicked = () => {
    trackClicked(ClickEvent.InviteFriendsPageClicked, {
      platform: 'mobile',
    })
    onCloseUserMenu()
  }

  return (
    <>
      <Box
        p='16px'
        w='100vw'
        borderBottom='1px solid'
        borderColor='grey.100'
        position='fixed'
        top={0}
        bg='grey.50'
        zIndex={2500}
      >
        <HStack justifyContent='space-between' alignItems='center'>
          <Box
            onClick={() => {
              handleCategory(undefined)
              handleDashboard(undefined)
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
            {isLoggedToPlatform ? (
              <>
                <Button
                  variant='transparent'
                  onClick={() => {
                    trackClicked(ClickEvent.ProfileBurgerMenuClicked, {
                      platform: 'mobile',
                    })
                    handleUserMenuClicked()
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
                  <Button
                    ml='8px'
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/search')
                    }}
                    aria-label='Search'
                    variant='unstyled'
                  >
                    <SearchIcon width={16} height={16} />
                  </Button>
                  <Box ml='8px'>
                    <MenuIcon width={16} height={16} />
                  </Box>
                </Button>
                {isOpenUserMenu && (
                  <Box
                    position='fixed'
                    top={0}
                    left={0}
                    bottom={0}
                    w='full'
                    zIndex={200}
                    bg='rgba(0, 0, 0, 0.3)'
                    animation='fadeIn 0.5s'
                  />
                )}
                <Slide
                  direction='right'
                  in={isOpenUserMenu}
                  style={{ zIndex: 201, transition: '0.1s' }}
                  onClick={onCloseUserMenu}
                >
                  <VStack
                    ml='40px'
                    bg='grey.100'
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
                                onCloseUserMenu()
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
                          <Profile />
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
                          bg='grey.300'
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

                      <VStack gap='24px' w='full' alignItems='start'>
                        <Divider borderColor='grey.200' />
                        <MobileDrawer
                          variant='common'
                          trigger={
                            <HStack
                              justifyContent='space-between'
                              w='full'
                              onClick={handleInviteFriendsClicked}
                            >
                              <HStack gap='4px' p='4px'>
                                <HeartIcon width={16} height={16} />
                                <Text {...paragraphMedium}>
                                  {refCopied ? 'Referral link copied!' : 'Invite friends'}
                                </Text>
                              </HStack>

                              <Text {...paragraphMedium}>{referralData?.refereeCount || 0}</Text>
                            </HStack>
                          }
                        >
                          <InviteFriendsPage />
                        </MobileDrawer>
                        <Divider borderColor='grey.200' />
                      </VStack>

                      <VStack my='24px' gap='24px'>
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
                                    onCloseUserMenu()
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
                              <WalletPage />
                            </MobileDrawer>
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
                                px='4px'
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
                        {client === 'etherspot' && (
                          <Button variant='contained' onClick={exportWallet} w='full' mt='12px'>
                            <KeyIcon width={16} height={16} />
                            Show Private Key
                          </Button>
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
              <HStack gap='8px'>
                <Menu variant='transparent' placement='top'>
                  <MenuButton>
                    <Dots />
                  </MenuButton>
                  <MenuList w='254px'>
                    <ThemeSwitcher />
                  </MenuList>
                </Menu>
                <LoginButtons login={loginToPlatform} />
              </HStack>
            )}
          </HStack>
        </HStack>
      </Box>
    </>
  )
}
