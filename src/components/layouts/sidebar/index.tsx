import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Image as ChakraImage,
  Link,
  Menu,
  MenuButton,
  MenuList,
  Slide,
  Spacer,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
  Skeleton,
} from '@chakra-ui/react'
import Image from 'next/image'
import React, { useCallback, useMemo } from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import SunIcon from '@/resources/icons/sun-icon.svg'
import MoonIcon from '@/resources/icons/moon-icon.svg'
import HomeIcon from '@/resources/icons/home-icon.svg'
import GridIcon from '@/resources/icons/grid-icon.svg'
import SquarePlusIcon from '@/resources/icons/square-plus-icon.svg'

import '@/app/style.css'
import {
  ClickEvent,
  CreateMarketClickedMetadata,
  LogoClickedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  useBalanceService,
} from '@/services'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { useWeb3Service } from '@/services/Web3Service'
import { LoginButton } from '@/components/common/login-button'
import CategoryFilter from '@/components/common/categories'
import { isMobile } from 'react-device-detect'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import '@rainbow-me/rainbowkit/styles.css'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { useThemeProvider } from '@/providers'
import usePageName from '@/hooks/use-page-name'
import WalletPage from '@/components/layouts/wallet-page'
import SwapIcon from '@/resources/icons/swap-icon.svg'
import WrapModal from '@/components/common/modals/wrap-modal'
import NextLink from 'next/link'
import { Overlay } from '@/components/common/overlay'
import SocialsFooter from '@/components/common/socials-footer'
import { cutUsername } from '@/utils/string'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import Profile from '@/components/layouts/profile'
import UserIcon from '@/resources/icons/user-icon.svg'
import LogoutIcon from '@/resources/icons/log-out-icon.svg'

export default function Sidebar() {
  const { setLightTheme, setDarkTheme, mode } = useThemeProvider()
  const { disconnectFromPlatform, disconnectLoading, displayName } = useAccount()
  const { overallBalanceUsd } = useBalanceService()
  const { toggleColorMode } = useColorMode()
  const { trackClicked } = useAmplitude()
  const account = useWalletAddress()
  const { isConnected, isConnecting, isReconnecting } = useWagmiAccount()
  const { client } = useWeb3Service()

  const userMenuLoading = false

  const pageName = usePageName()
  // const userMenuLoading = useMemo(() => {
  //   const userWithProfileLoading = isConnected && getProfileDataLoading
  //   // const userWithoutProfileLoading = isConnected && !user?.displayName
  //   const userWithoutProfileLoading = false
  //   const connectDisconnectReconnectLoading = disconnectLoading || isConnecting || isReconnecting
  //   return userWithProfileLoading || userWithoutProfileLoading || connectDisconnectReconnectLoading
  // }, [getProfileDataLoading, disconnectLoading, isConnecting, isReconnecting, isConnected, user])
  //
  // console.log(isConnected && !user?.displayName)

  const {
    isOpen: isOpenWalletPage,
    onToggle: onToggleWalletPage,
    onClose: onCloseWalletPage,
  } = useDisclosure()
  const {
    isOpen: isOpenAuthMenu,
    onToggle: onToggleAuthMenu,
    onClose: onCloseAuthMenu,
  } = useDisclosure()

  const {
    isOpen: isWrapModalOpen,
    onOpen: onOpenWrapModal,
    onClose: onCloseWrapModal,
  } = useDisclosure()

  const { isOpen: isOpenProfile, onToggle: onToggleProfile } = useDisclosure()

  const handleOpenWalletPage = useCallback(() => {
    if (client === 'eoa') return
    onToggleWalletPage()
  }, [client])
  const handleOpenWrapModal = useCallback(() => onOpenWrapModal(), [])
  const handleOpenProfile = () => {
    onCloseWalletPage()
    onCloseAuthMenu()
    onToggleProfile()
  }
  // const handleOpenProfileDrawer = useCallback(() => {
  //   onCloseWalletPage()
  //   onCloseWrapModal()
  //   onCloseAuthMenu()
  //
  //   if (!isOpenProfileDrawer) {
  //     onOpenProfileDrawer()
  //     return
  //   }
  //
  //   onCloseProfileDrawer()
  //   return
  // }, [isOpenWalletPage, isOpenProfileDrawer])

  return (
    <>
      <VStack
        padding='16px 8px'
        borderRight='1px solid'
        borderColor='grey.200'
        h='full'
        minW={'188px'}
        minH={'100vh'}
        zIndex={200}
        bg='grey.100'
        pos='fixed'
        overflowY='auto'
      >
        <NextLink href='/' passHref>
          <Link
            onClick={() => {
              trackClicked<LogoClickedMetadata>(ClickEvent.LogoClicked, { page: pageName })
              window.localStorage.removeItem('SORT')
            }}
          >
            <Image
              src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
              height={32}
              width={156}
              alt='logo'
            />
          </Link>
        </NextLink>

        {isConnected ? (
          <>
            <VStack mt='16px' w='full' gap='8px'>
              {client !== 'eoa' ? (
                <>
                  {userMenuLoading ? (
                    <Skeleton height='24px' w='full' variant='common' />
                  ) : (
                    <Button
                      variant='transparent'
                      onClick={() => {
                        trackClicked<ProfileBurgerMenuClickedMetadata>(
                          ClickEvent.ProfileBurgerMenuClicked,
                          {
                            option: 'Wallet',
                          }
                        )
                        handleOpenWalletPage()
                      }}
                      w='full'
                      bg={isOpenWalletPage ? 'grey.200' : 'unset'}
                    >
                      <HStack w='full'>
                        <WalletIcon width={16} height={16} />
                        <Text fontWeight={500} fontSize='14px'>
                          {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
                        </Text>
                      </HStack>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {userMenuLoading ? (
                    <Skeleton height='24px' w='full' variant='common' />
                  ) : (
                    <Button
                      variant='transparent'
                      w='full'
                      onClick={() => {
                        trackClicked(ClickEvent.WithdrawClicked)
                        handleOpenWrapModal()
                      }}
                    >
                      <HStack w='full'>
                        <SwapIcon width={16} height={16} />
                        <Text fontWeight={500} fontSize='14px'>
                          Wrap ETH
                        </Text>
                      </HStack>
                    </Button>
                  )}
                </>
              )}

              {userMenuLoading ? (
                <Skeleton height='24px' w='full' variant='common' />
              ) : (
                <NextLink href='/portfolio' passHref style={{ width: '100%' }}>
                  <Link
                    onClick={() => {
                      trackClicked<ProfileBurgerMenuClickedMetadata>(
                        ClickEvent.ProfileBurgerMenuClicked,
                        {
                          option: 'Portfolio',
                        }
                      )
                    }}
                    variant='transparent'
                    w='full'
                    bg={pageName === 'Portfolio' ? 'grey.200' : 'unset'}
                  >
                    <HStack w='full'>
                      <PortfolioIcon width={16} height={16} />
                      <Text fontWeight={500} fontSize='14px'>
                        Portfolio
                      </Text>
                    </HStack>
                  </Link>
                </NextLink>
              )}

              <Menu isOpen={isOpenAuthMenu} onClose={onToggleAuthMenu} variant='transparent'>
                {userMenuLoading ? (
                  <Skeleton height='24px' w='full' variant='common' />
                ) : (
                  <MenuButton
                    as={Button}
                    onClick={onToggleAuthMenu}
                    rightIcon={<ChevronDownIcon width='16px' height='16px' />}
                    bg={isOpenAuthMenu ? 'grey.200' : 'unset'}
                    h='24px'
                    px='8px'
                    w='full'
                    _active={{
                      bg: 'grey.200',
                    }}
                    _hover={{
                      bg: 'grey.200',
                    }}
                  >
                    <HStack gap='8px'>
                      <Flex
                        borderRadius={'2px'}
                        h={'16px'}
                        w={'16px'}
                        bg='grey.300'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Text {...paragraphMedium} className={'amp-mask'}>
                          {'O'}
                        </Text>
                      </Flex>
                      {/*{user?.pfpUrl?.includes('http') ? (*/}
                      {/*  <ChakraImage*/}
                      {/*    src={user.pfpUrl}*/}
                      {/*    borderRadius={'2px'}*/}
                      {/*    h={'16px'}*/}
                      {/*    w={'16px'}*/}
                      {/*    objectFit='cover'*/}
                      {/*    className='amp-block'*/}
                      {/*  />*/}
                      {/*) : (*/}
                      {/*  <Flex*/}
                      {/*    borderRadius={'2px'}*/}
                      {/*    h={'16px'}*/}
                      {/*    w={'16px'}*/}
                      {/*    bg='grey.300'*/}
                      {/*    alignItems='center'*/}
                      {/*    justifyContent='center'*/}
                      {/*  >*/}
                      {/*    <Text {...paragraphMedium} className={'amp-mask'}>*/}
                      {/*      {!!user?.displayName?.length ? user.displayName[0].toUpperCase() : 'O'}*/}
                      {/*    </Text>*/}
                      {/*  </Flex>*/}
                      {/*)}*/}
                      <Text
                        {...paragraphMedium}
                        className={'amp-mask'}
                        whiteSpace='nowrap'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        maxW='112px'
                      >
                        {displayName}
                        {/*{user.displayName*/}
                        {/*  ? cutUsername(user.displayName, 13)*/}
                        {/*  : truncateEthAddress(account)}*/}
                      </Text>
                    </HStack>
                  </MenuButton>
                )}

                <MenuList borderRadius='2px' w='180px' zIndex={2}>
                  <HStack gap='4px' mb='4px'>
                    <Button
                      variant={mode === 'dark' ? 'grey' : 'black'}
                      w='full'
                      onClick={() => {
                        toggleColorMode()
                        setLightTheme()
                        trackClicked(ClickEvent.UIModeClicked, {
                          mode: 'Light On',
                        })
                      }}
                    >
                      <SunIcon width={16} height={16} />
                    </Button>
                    <Button
                      variant={mode === 'dark' ? 'black' : 'grey'}
                      w='full'
                      onClick={() => {
                        toggleColorMode()
                        setDarkTheme()
                        trackClicked(ClickEvent.UIModeClicked, {
                          mode: 'Dark On',
                        })
                      }}
                    >
                      <MoonIcon width={16} height={16} />
                    </Button>
                  </HStack>
                  <Button
                    variant='grey'
                    w='full'
                    onClick={handleOpenProfile}
                    justifyContent='flex-start'
                  >
                    <UserIcon width={16} height={16} />
                    Profile
                  </Button>
                  <Button
                    variant='grey'
                    w='full'
                    onClick={() => {
                      trackClicked(ClickEvent.SignOutClicked, {
                        option: 'Sign Out',
                      })
                      disconnectFromPlatform()
                      onToggleAuthMenu()
                      isOpenProfile && onToggleProfile()
                    }}
                    justifyContent='flex-start'
                  >
                    <LogoutIcon width={16} height={16} />
                    Log Out
                  </Button>
                </MenuList>
              </Menu>
            </VStack>
          </>
        ) : (
          <Box mt='16px' w='full'>
            <LoginButton />
          </Box>
        )}
        <Divider my='12px' />
        <NextLink href='/' passHref style={{ width: '100%' }}>
          <Link
            onClick={() => {
              trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
                option: 'Markets',
              })
            }}
            variant='transparent'
            w='full'
            bg={pageName === 'Explore Markets' ? 'grey.200' : 'unset'}
          >
            <HStack w='full'>
              <GridIcon width={16} height={16} />
              <Text fontWeight={500} fontSize='14px'>
                Markets
              </Text>
            </HStack>
          </Link>
        </NextLink>
        <NextLink href='/feed' passHref style={{ width: '100%' }}>
          <Link
            onClick={() => {
              trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
                option: 'Home',
              })
            }}
            variant='transparent'
            w='full'
            bg={pageName === 'Home' ? 'grey.200' : 'unset'}
          >
            <HStack w='full'>
              <HomeIcon width={16} height={16} />
              <Text fontWeight={500} fontSize='14px'>
                Feed
              </Text>
            </HStack>
          </Link>
        </NextLink>
        <NextLink
          href='https://limitlesslabs.notion.site/Limitless-Creators-101-b529a4a72cd4406cacb55f27395c9b56'
          target='_blank'
          rel='noopener'
          passHref
          style={{ width: '100%' }}
        >
          <Link
            isExternal
            onClick={() => {
              trackClicked<CreateMarketClickedMetadata>(ClickEvent.CreateMarketClicked, {
                page: pageName,
              })
            }}
            variant='transparent'
            w='full'
          >
            <HStack w='full'>
              <SquarePlusIcon width={16} height={16} />
              <Text fontWeight={500} fontSize='14px'>
                Suggest market
              </Text>
            </HStack>
          </Link>
        </NextLink>
        {!isMobile && <CategoryFilter />}

        <Spacer />

        <Divider />

        <SocialsFooter />
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
          animation='fadeIn 0.5s'
        ></Box>
      )}
      <Slide
        direction='left'
        in={isOpenWalletPage}
        style={{
          zIndex: 100,
          marginTop: '20px',
          marginLeft: '197px',
          transition: '0.1s',
        }}
        onClick={() => {
          trackClicked(ClickEvent.WalletClicked, {
            page: pageName,
          })
          onToggleWalletPage()
        }}
      >
        <WalletPage onClose={onToggleWalletPage} />
      </Slide>
      <Slide
        direction='left'
        in={isOpenProfile}
        style={{
          zIndex: 100,
          marginTop: '20px',
          marginLeft: '197px',
          transition: '0.1s',
        }}
        onClick={() => {
          trackClicked(ClickEvent.ProfileBurgerMenuClicked, {
            page: pageName,
          })
          onToggleProfile()
        }}
      >
        {isOpenProfile && <Profile />}
      </Slide>

      {isWrapModalOpen && <WrapModal isOpen={isWrapModalOpen} onClose={onCloseWrapModal} />}

      <Overlay show={isOpenProfile} onClose={onToggleProfile} />
    </>
  )
}
