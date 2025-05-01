import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { useFundWallet } from '@privy-io/react-auth'
import { useAtom } from 'jotai/index'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { LoginButtons } from '@/components/common/login-button'
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
import SeacrchIcon from '@/resources/icons/search.svg'
import FeedIcon from '@/resources/icons/sidebar/Feed.svg'
import GridIcon from '@/resources/icons/sidebar/Markets.svg'
import PortfolioIcon from '@/resources/icons/sidebar/Portfolio.svg'
import SidebarIcon from '@/resources/icons/sidebar/crone-icon.svg'
import DashboardIcon from '@/resources/icons/sidebar/dashboard.svg'
import {
  ClickEvent,
  ClobPositionWithType,
  HistoryPositionWithType,
  LogoClickedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  usePosition,
  useTradingService,
} from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { MarketStatus, Sort, SortStorageName } from '@/types'
import { DISABLE_SEARCH_PAGES, SEARCH_HOTKEY_KEYS } from '@/utils/consts'
import { ReferralLink } from '../common/referral-link'

export default function Header() {
  const [, setSelectedSort] = useAtom(sortAtom)
  const { dashboard, handleCategory, handleDashboard } = useTokenFilter()
  const pageName = usePageName()
  const { trackClicked } = useAmplitude()
  const { isLoggedToPlatform } = useClient()
  const { fundWallet } = useFundWallet()
  const { data: positions } = usePosition()
  const { marketPageOpened, onCloseMarketPage } = useTradingService()
  const { mode } = useThemeProvider()
  const router = useRouter()
  const {
    account,
    loginToPlatform,
    setWalletPageOpened,
    setProfilePageOpened,
    profilePageOpened,
    walletPageOpened,
  } = useAccount()
  const handleBuyCryptoClicked = async () => {
    trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.BuyCryptoClicked)
    await fundWallet(account as string)
  }

  const handleOpenWalletPage = () => {
    setWalletPageOpened(true)
    if (marketPageOpened) {
      onCloseMarketPage()
    }
  }

  const handleOpenProfile = () => {
    setProfilePageOpened(true)
    if (marketPageOpened) {
      onCloseMarketPage()
    }
  }
  const handleOpenReferral = () => {
    if (marketPageOpened) {
      onCloseMarketPage()
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        SEARCH_HOTKEY_KEYS.includes(event.key) &&
        !DISABLE_SEARCH_PAGES.includes(pageName) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault()
        trackClicked(ClickEvent.SearchHotKeyClicked)
        router.push('/search')
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  const hasWinningPosition = useMemo(() => {
    return positions?.positions.some((position) => {
      if (position.type === 'amm') {
        return (position as HistoryPositionWithType).market.closed
      }
      return (position as ClobPositionWithType).market.status === MarketStatus.RESOLVED
    })
  }, [positions])

  return (
    <Box position='fixed' w='full' top={0} zIndex={2100}>
      <HStack
        w='full'
        justifyContent='space-between'
        px='16px'
        py='7.5px'
        borderBottom='1px solid'
        borderColor='grey.100'
        bg='grey.50'
      >
        <HStack gap='16px'>
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
              <Image
                src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
                height={32}
                width={156}
                alt='logo'
              />
            </Link>
          </ReferralLink>
          <HStack gap='16px'>
            <ReferralLink href={`/`} passHref>
              <Link
                variant='transparent'
                bg={
                  pageName === 'Explore Markets' && dashboard !== 'marketwatch'
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
            <ReferralLink href={`/market-watch`} passHref>
              <Link
                variant='transparent'
                bg={dashboard === 'marketwatch' ? 'grey.100' : 'unset'}
                rounded='8px'
                onClick={() => {
                  trackClicked<ProfileBurgerMenuClickedMetadata>(
                    ClickEvent.ProfileBurgerMenuClicked,
                    {
                      option: 'Market Watch',
                    }
                  )
                }}
              >
                <HStack w='full' gap='4px'>
                  <DashboardIcon width={16} height={16} color='#FF9200' />
                  <Text fontWeight={500} fontSize='14px'>
                    Market watch
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
        <HStack gap='16px'>
          <Popover trigger='hover' placement='bottom' gutter={12}>
            <PopoverTrigger>
              <HStack
                color='grey.500'
                onClick={() => {
                  trackClicked(ClickEvent.SearchButtonClicked)
                  router.push('/search')
                }}
                cursor='pointer'
                _hover={{ color: 'grey.800' }}
              >
                <SeacrchIcon width={16} height={16} />
                <Text {...paragraphMedium} color='grey.500' _hover={{ color: 'grey.800' }}>
                  Search
                </Text>
              </HStack>
            </PopoverTrigger>
            <PopoverContent
              bg='grey.50'
              display='flex'
              flexDirection='row'
              borderColor='grey.200'
              w='auto'
              p='0'
              borderRadius='8px'
            >
              <PopoverBody px='8px' py='4px' w='auto' display='flex' flexDirection='row'>
                <Text {...paragraphMedium} color='grey.500' p='8px'>
                  Search for any market
                </Text>
                <Box p='8px' border='1px solid' borderRadius='8px' borderColor='grey.200'>
                  <Text {...paragraphMedium}>/</Text>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
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
              {walletPageOpened && (
                <SideBarPage>
                  <WalletPage />
                </SideBarPage>
              )}
              {profilePageOpened && (
                <SideBarPage>
                  <Profile />
                </SideBarPage>
              )}
            </HStack>
          ) : (
            <LoginButtons login={loginToPlatform} />
          )}
        </HStack>
      </HStack>
    </Box>
  )
}
