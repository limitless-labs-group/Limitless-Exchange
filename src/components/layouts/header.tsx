import { Box, Button, Flex, HStack, Link, Slide, Text, useDisclosure } from '@chakra-ui/react'
import { useFundWallet } from '@privy-io/react-auth'
import { useAtom } from 'jotai/index'
import Image from 'next/image'
import NextLink from 'next/link'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { LoginButtons } from '@/components/common/login-button'
import { CategoryItems } from '@/components/common/markets/sidebar-item'
import SideBarPage from '@/components/common/side-bar-page'
import UserMenuDesktop from '@/components/layouts/user-menu-desktop'
import WalletPage from '@/components/layouts/wallet-page'
import { sortAtom } from '@/atoms/market-sort'
import { Profile } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import useClient from '@/hooks/use-client'
import usePageName from '@/hooks/use-page-name'
import { useThemeProvider } from '@/providers'
import DepositIcon from '@/resources/icons/deposit-icon.svg'
import Logo from '@/resources/icons/logo.svg'
import FeedIcon from '@/resources/icons/sidebar/Feed.svg'
import GridIcon from '@/resources/icons/sidebar/Markets.svg'
import PortfolioIcon from '@/resources/icons/sidebar/Portfolio.svg'
import SidebarIcon from '@/resources/icons/sidebar/crone-icon.svg'
import DashboardIcon from '@/resources/icons/sidebar/dashboard.svg'
import {
  ClickEvent,
  LogoClickedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  usePosition,
  useTradingService,
} from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { MarketStatus, Sort, SortStorageName } from '@/types'
import { ReferralLink } from '../common/referral-link'

export default function Header() {
  const { mode } = useThemeProvider()
  const [, setSelectedSort] = useAtom(sortAtom)
  const { dashboard, handleCategory, handleDashboard, selectedCategory } = useTokenFilter()
  const pageName = usePageName()
  const { trackClicked } = useAmplitude()
  const { isLoggedToPlatform } = useClient()
  const { fundWallet } = useFundWallet()
  const { data: positions } = usePosition()
  const { isOpen: isOpenWalletPage, onToggle: onToggleWalletPage } = useDisclosure()
  const { isOpen: isOpenProfile, onToggle: onToggleProfile } = useDisclosure()
  const { marketPageOpened, onCloseMarketPage } = useTradingService()
  const { account, loginToPlatform } = useAccount()
  const handleBuyCryptoClicked = async () => {
    trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.BuyCryptoClicked)
    await fundWallet(account as string)
  }

  const handleOpenWalletPage = () => {
    onToggleWalletPage()
    if (marketPageOpened) {
      onCloseMarketPage()
    }
  }

  const handleOpenProfile = () => {
    onToggleProfile()
    if (marketPageOpened) {
      onCloseMarketPage()
    }
  }

  const hasWinningPosition = useMemo(() => {
    return positions?.some((position) => {
      if (position.type === 'amm') {
        return position.market.closed
      }
      return position.market.status === MarketStatus.RESOLVED
    })
  }, [positions])

  return (
    <Box position='fixed' w='full' top={0} zIndex={2000}>
      <HStack
        w='full'
        justifyContent='space-between'
        px='16px'
        py='7.5px'
        borderBottom='1px solid'
        borderColor='grey.100'
        bg='grey.50'
      >
        <HStack gap='32px'>
          <ReferralLink href='/' passHref>
            <Link
              onClick={() => {
                trackClicked<LogoClickedMetadata>(ClickEvent.LogoClicked, { page: pageName })
                handleCategory(undefined)
                handleDashboard(undefined)
                window.localStorage.setItem(SortStorageName.SORT, JSON.stringify(Sort.DEFAULT))
                setSelectedSort({ sort: Sort.DEFAULT })
              }}
              style={{ textDecoration: 'none' }}
              _hover={{ textDecoration: 'none' }}
            >
              {/* <Image */}
              {/*   src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'} */}
              {/*   height={32} */}
              {/*   width={156} */}
              {/*   alt='logo' */}
              {/* /> */}
              <HStack minW='130px' w='full'>
                <Logo />
                <Text
                  {...paragraphMedium}
                  fontSize='16px'
                  _hover={{
                    '&::after': {
                      content: '"Limitmore"',
                    },
                    '& > span': {
                      display: 'none',
                    },
                  }}
                  position='relative'
                >
                  <span>Limitless</span>
                </Text>
              </HStack>
            </Link>
          </ReferralLink>
          <HStack gap='16px'>
            <ReferralLink href={`/`} passHref>
              <Link
                variant='transparent'
                bg={
                  pageName === 'Explore Markets' && dashboard !== 'marketcrash'
                    ? 'grey.100'
                    : 'unset'
                }
                rounded='8px'
                onClick={() => {
                  trackClicked<ProfileBurgerMenuClickedMetadata>(
                    ClickEvent.ProfileBurgerMenuClicked,
                    {
                      option: 'Home',
                    }
                  )
                  handleDashboard(undefined)
                  handleCategory(undefined)
                }}
              >
                <HStack w='full' whiteSpace='nowrap' gap='4px'>
                  <GridIcon width={16} height={16} />
                  <Text {...paragraphMedium} fontWeight={500}>
                    Markets
                  </Text>
                </HStack>
              </Link>
            </ReferralLink>
            <ReferralLink href={`/market-crash`} passHref>
              <Link
                variant='transparent'
                bg={dashboard === 'marketcrash' ? 'grey.100' : 'unset'}
                rounded='8px'
                onClick={() => {
                  trackClicked<ProfileBurgerMenuClickedMetadata>(
                    ClickEvent.ProfileBurgerMenuClicked,
                    {
                      option: 'Market Crash',
                    }
                  )
                }}
              >
                <HStack w='full' gap='4px'>
                  <DashboardIcon width={16} height={16} color='#FF9200' />
                  <Text fontWeight={500} fontSize='14px'>
                    Market crash
                  </Text>
                </HStack>
              </Link>
            </ReferralLink>
            <ReferralLink href='/leaderboard' passHref>
              <Link
                onClick={() => {
                  trackClicked<ProfileBurgerMenuClickedMetadata>(
                    ClickEvent.ProfileBurgerMenuClicked,
                    {
                      option: 'Leaderboard',
                    }
                  )
                  handleCategory(undefined)
                  handleDashboard(undefined)
                }}
                variant='transparent'
                w='full'
                bg={pageName === 'Leaderboard' ? 'grey.100' : 'unset'}
                rounded='8px'
              >
                <HStack w='full' gap='4px'>
                  <SidebarIcon width={16} height={16} />
                  <Text fontWeight={500} fontSize='14px'>
                    Leaderboard
                  </Text>
                </HStack>
              </Link>
            </ReferralLink>
            <ReferralLink href='/feed' passHref>
              <Link
                onClick={() => {
                  trackClicked<ProfileBurgerMenuClickedMetadata>(
                    ClickEvent.ProfileBurgerMenuClicked,
                    {
                      option: 'Feed',
                    }
                  )
                  handleCategory(undefined)
                  handleDashboard(undefined)
                }}
                variant='transparent'
                w='full'
                bg={pageName === 'Feed' ? 'grey.100' : 'unset'}
                rounded='8px'
              >
                <HStack w='full' gap='4px'>
                  <FeedIcon width={16} height={16} />
                  <Text fontWeight={500} fontSize='14px'>
                    Feed
                  </Text>
                </HStack>
              </Link>
            </ReferralLink>
          </HStack>
        </HStack>
        {isLoggedToPlatform ? (
          <HStack gap='16px'>
            <Button variant='contained' onClick={handleBuyCryptoClicked} minW='98px'>
              <DepositIcon />
              Deposit
            </Button>
            <NextLink href='/portfolio' passHref>
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
            <UserMenuDesktop
              handleOpenWalletPage={handleOpenWalletPage}
              handleOpenProfile={handleOpenProfile}
            />
            {isOpenWalletPage && (
              <SideBarPage>
                <WalletPage onClose={onToggleWalletPage} />
              </SideBarPage>
            )}
            {isOpenProfile && (
              <SideBarPage>
                <Profile isOpen={isOpenProfile} onClose={onToggleProfile} />
              </SideBarPage>
            )}
          </HStack>
        ) : (
          <LoginButtons login={loginToPlatform} />
        )}
      </HStack>
      {pageName === 'Explore Markets' && (
        <HStack py='4px' px='12px' bg='grey.50'>
          <CategoryItems />
        </HStack>
      )}
    </Box>
  )
}
