import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
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
} from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css'
import Image from 'next/image'
import NextLink from 'next/link'
import React, { useCallback, useMemo } from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import Avatar from '@/components/common/avatar'
import { LoginButton } from '@/components/common/login-button'
import { CategoryItems } from '@/components/common/markets/sidebar-item'
import WrapModal from '@/components/common/modals/wrap-modal'
import { Overlay } from '@/components/common/overlay'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import SocialsFooter from '@/components/common/socials-footer'
import WalletPage from '@/components/layouts/wallet-page'
import '@/app/style.css'
import { Profile } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import usePageName from '@/hooks/use-page-name'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useThemeProvider } from '@/providers'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import LogoutIcon from '@/resources/icons/log-out-icon.svg'
import MoonIcon from '@/resources/icons/moon-icon.svg'
import FeedIcon from '@/resources/icons/sidebar/Feed.svg'
import GridIcon from '@/resources/icons/sidebar/Markets.svg'
import PortfolioIcon from '@/resources/icons/sidebar/Portfolio.svg'
import WalletIcon from '@/resources/icons/sidebar/Wallet.svg'
import SwapIcon from '@/resources/icons/sidebar/Wrap.svg'
import SidebarIcon from '@/resources/icons/sidebar/crone-icon.svg'
import SunIcon from '@/resources/icons/sun-icon.svg'
import UserIcon from '@/resources/icons/user-icon.svg'
import {
  ClickEvent,
  LogoClickedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  useBalanceQuery,
  useBalanceService,
  useEtherspot,
  usePosition,
} from '@/services'
import { useMarkets } from '@/services/MarketsService'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup } from '@/types'
import { NumberUtil } from '@/utils'

export default function Sidebar() {
  const { setLightTheme, setDarkTheme, mode } = useThemeProvider()
  const { disconnectFromPlatform, displayName, profileData, profileLoading } = useAccount()
  const { overallBalanceUsd, balanceLoading } = useBalanceService()
  const { toggleColorMode } = useColorMode()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { trackClicked } = useAmplitude()
  const account = useWalletAddress()
  const { isConnected, isConnecting } = useWagmiAccount()
  const { client } = useWeb3Service()
  const { isLoadingSmartWalletAddress } = useEtherspot()
  const { data: totalVolume } = useTotalTradingVolume()
  const { data: positions } = usePosition()
  const { selectedCategory, handleCategory } = useTokenFilter()
  const { data, isLoading } = useMarkets(null)

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  const pageName = usePageName()
  const userMenuLoading = useMemo(() => {
    if (isConnecting) {
      return true
    }
    if (isConnected) {
      return profileData === undefined || profileLoading || isLoadingSmartWalletAddress
    }
    return false //#fix for dev env
  }, [isConnected, profileLoading, isLoadingSmartWalletAddress, isConnecting, profileData])

  const hasWinningPosition = useMemo(() => {
    return positions?.some((position) => position.market.closed)
  }, [positions])

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

  const walletTypeActionButton = useMemo(() => {
    const smartWalletBalanceLoading = (client !== 'eoa' && balanceLoading) || !balanceOfSmartWallet
    if (userMenuLoading || smartWalletBalanceLoading) {
      return (
        <Box w='full'>
          <Skeleton height={24} />
        </Box>
      )
    }
    return client !== 'eoa' ? (
      <Button
        variant='transparent'
        onClick={() => {
          trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
            option: 'Wallet',
          })
          handleOpenWalletPage()
        }}
        w='full'
        bg={isOpenWalletPage ? 'grey.100' : 'unset'}
      >
        <HStack w='full'>
          <WalletIcon width={16} height={16} />
          <Text fontWeight={500} fontSize='14px'>
            {NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
          </Text>
        </HStack>
      </Button>
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
    )
  }, [
    client,
    isOpenWalletPage,
    overallBalanceUsd,
    userMenuLoading,
    balanceLoading,
    balanceOfSmartWallet,
  ])

  const volumeArray = totalVolume
    ? `$${NumberUtil.formatThousands(totalVolume.toFixed(0), 0)}`.split('')
    : []

  return (
    <>
      <VStack
        padding='16px 8px'
        borderRight='1px solid'
        borderColor='grey.100'
        h='full'
        minW={'188px'}
        minH={'100vh'}
        zIndex={200}
        bg='grey.50'
        pos='fixed'
        overflowY='auto'
      >
        <NextLink href='/' passHref style={{ width: '100%', textDecoration: 'none' }}>
          <Link
            onClick={() => {
              trackClicked<LogoClickedMetadata>(ClickEvent.LogoClicked, { page: pageName })
              window.localStorage.removeItem('SORT')
              handleCategory(undefined)
            }}
            style={{ textDecoration: 'none' }}
            _hover={{ textDecoration: 'none' }}
          >
            <HStack w='full' alignItems='center'>
              <Image
                src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
                height={32}
                width={156}
                alt='logo'
              />
            </HStack>
          </Link>
        </NextLink>

        {isConnected ? (
          <>
            <VStack mt='16px' w='full' gap='8px'>
              {walletTypeActionButton}

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
                  bg={pageName === 'Portfolio' ? 'grey.100' : 'unset'}
                  rounded='8px'
                >
                  <HStack w='full' gap='0'>
                    <PortfolioIcon width={16} height={16} />
                    <Text fontWeight={500} fontSize='14px' marginLeft='8px'>
                      Portfolio
                    </Text>
                    {hasWinningPosition ? (
                      <Flex
                        bg='red.500'
                        h='8px'
                        w='8px'
                        borderRadius='10px'
                        marginLeft='3px'
                        alignSelf='start'
                      />
                    ) : null}
                  </HStack>
                </Link>
              </NextLink>

              <Menu isOpen={isOpenAuthMenu} onClose={onToggleAuthMenu} variant='transparent'>
                {userMenuLoading ? (
                  <Box w='full'>
                    <Skeleton height={24} />
                  </Box>
                ) : (
                  <MenuButton
                    as={Button}
                    onClick={onToggleAuthMenu}
                    rightIcon={<ChevronDownIcon width='16px' height='16px' />}
                    bg={isOpenAuthMenu ? 'grey.100' : 'unset'}
                    h='24px'
                    px='8px'
                    w='full'
                    _active={{
                      bg: 'grey.100',
                    }}
                    _hover={{
                      bg: 'grey.100',
                    }}
                  >
                    <HStack gap='8px'>
                      <Avatar account={account as string} avatarUrl={profileData?.pfpUrl} />
                      <Text
                        {...paragraphMedium}
                        className={'amp-mask'}
                        whiteSpace='nowrap'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        maxW='112px'
                      >
                        {displayName}
                      </Text>
                    </HStack>
                  </MenuButton>
                )}

                <MenuList borderRadius='8px' w='180px' zIndex={2}>
                  <HStack gap='4px' mb='4px'>
                    <Button
                      variant={mode === 'dark' ? 'transparent' : 'black'}
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
                      variant={mode === 'dark' ? 'black' : 'transparent'}
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
                    variant='transparent'
                    w='full'
                    onClick={handleOpenProfile}
                    justifyContent='flex-start'
                  >
                    <UserIcon width={16} height={16} />
                    Profile
                  </Button>
                  <Button
                    variant='transparent'
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
        <NextLink href='/leaderboard' passHref style={{ width: '100%' }}>
          <Link
            onClick={() => {
              trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
                option: 'Leaderboard',
              })
            }}
            variant='transparent'
            w='full'
            bg={pageName === 'Leaderboard' ? 'grey.100' : 'unset'}
            rounded='8px'
          >
            <HStack w='full'>
              <SidebarIcon width={16} height={16} />
              <Text fontWeight={500} fontSize='14px'>
                Leaderboard
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
            bg={pageName === 'Home' ? 'grey.100' : 'unset'}
            rounded='8px'
          >
            <HStack w='full'>
              <FeedIcon width={16} height={16} />
              <Text fontWeight={500} fontSize='14px'>
                Feed
              </Text>
            </HStack>
          </Link>
        </NextLink>

        <Divider my='12px' />

        <NextLink href='/' passHref style={{ width: '100%' }}>
          <Link
            onClick={() => {
              trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
                option: 'Markets',
              })
              handleCategory(undefined)
            }}
            variant='transparent'
            w='full'
            bg={pageName === 'Explore Markets' && !selectedCategory ? 'grey.100' : 'unset'}
            rounded='8px'
          >
            <HStack w='full'>
              <GridIcon width={16} height={16} />
              <Text fontWeight={500} fontSize='14px'>
                {`All markets ${isLoading ? '' : `(${markets?.length})`} `}
              </Text>
            </HStack>
          </Link>
        </NextLink>

        <CategoryItems />

        <Spacer />
        {totalVolume && (
          <NextLink
            href='https://dune.com/limitless_exchange/limitless'
            target='_blank'
            style={{ width: '100%' }}
          >
            <Paper
              w='full'
              justifyContent='space-between'
              display='flex'
              cursor='pointer'
              _hover={{ bg: 'grey.100' }}
              borderRadius='8px'
            >
              {volumeArray.map((volumeSymbol, index) => (
                <Text key={index} {...paragraphRegular}>
                  {volumeSymbol}
                </Text>
              ))}
            </Paper>
          </NextLink>
        )}
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
        <Profile isOpen={isOpenProfile} />
      </Slide>

      {isWrapModalOpen && <WrapModal isOpen={isWrapModalOpen} onClose={onCloseWrapModal} />}

      <Overlay show={isOpenProfile} onClose={onToggleProfile} />
    </>
  )
}
