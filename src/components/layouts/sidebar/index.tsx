import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Image as ChakraImage,
  Menu,
  MenuButton,
  MenuList,
  Slide,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import '../../../../src/app/style.css'
import SunIcon from '@/resources/icons/sun-icon.svg'
import MoonIcon from '@/resources/icons/moon-icon.svg'

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
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { cutUsername } from '@/utils/string'
import { usePathname, useRouter } from 'next/navigation'
import { useWeb3Service } from '@/services/Web3Service'
import { LoginButton } from '@/components/common/login-button'
import CategoryFilter from '@/components/common/categories'
import { isMobile } from 'react-device-detect'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import '@rainbow-me/rainbowkit/styles.css'
import useDisconnectAccount from '@/hooks/use-disconnect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import TokenFilter from '@/components/common/token-filter'
import { useThemeProvider } from '@/providers'
import usePageName from '@/hooks/use-page-name'
import WalletPage from '@/components/layouts/wallet-page'

export default function Sidebar() {
  const { setLightTheme, setDarkTheme, mode } = useThemeProvider()
  const { toggleColorMode } = useColorMode()

  const { isConnected } = useWagmiAccount()
  const { trackClicked } = useAmplitude()

  const { overallBalanceUsd } = useBalanceService()
  const { userInfo } = useAccount()
  const address = useWalletAddress()
  const router = useRouter()
  const { disconnectFromPlatform } = useDisconnectAccount()
  const { client } = useWeb3Service()
  const pathname = usePathname()
  const pageName = usePageName()

  const { isOpen: isOpenWalletPage, onToggle: onToggleWalletPage } = useDisclosure()
  const { isOpen: isOpenAuthMenu, onToggle: onToggleAuthMenu } = useDisclosure()

  const handleOpenWalletPage = () => {
    if (client !== 'eoa') {
      onToggleWalletPage()
    }
  }

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
      >
        <Button
          variant='transparent'
          onClick={() => {
            trackClicked<LogoClickedMetadata>(ClickEvent.LogoClicked, { page: pageName })
            router.push('/')
          }}
          _hover={{ bg: 'unset' }}
        >
          <Image
            src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
            height={32}
            width={156}
            alt='logo'
          />
        </Button>
        {isConnected && (
          <VStack my='16px' w='full' gap='8px'>
            {client !== 'eoa' && (
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
            <Button
              variant='transparent'
              onClick={() => {
                trackClicked<ProfileBurgerMenuClickedMetadata>(
                  ClickEvent.ProfileBurgerMenuClicked,
                  {
                    option: 'Portfolio',
                  }
                )
                router.push('/portfolio')
              }}
              w='full'
              bg={pathname === '/portfolio' ? 'grey.200' : 'unset'}
            >
              <HStack w='full'>
                <PortfolioIcon width={16} height={16} />
                <Text fontWeight={500} fontSize='14px'>
                  Portfolio
                </Text>
              </HStack>
            </Button>
            <Menu isOpen={isOpenAuthMenu} onClose={onToggleAuthMenu} variant='transparent'>
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
                  {userInfo?.profileImage?.includes('http') ? (
                    <ChakraImage
                      src={userInfo.profileImage}
                      borderRadius={'2px'}
                      h={'16px'}
                      w={'16px'}
                      objectFit='cover'
                      className='amp-block'
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
                      <Text {...paragraphMedium} className={'amp-mask'}>
                        {userInfo?.name ? userInfo?.name[0].toUpperCase() : 'O'}
                      </Text>
                    </Flex>
                  )}
                  <Text {...paragraphMedium} className={'amp-mask'}>
                    {userInfo?.name ? cutUsername(userInfo.name) : truncateEthAddress(address)}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList borderRadius='2px' w='171px' zIndex={2}>
                <HStack gap='4px' mb='4px'>
                  <Button
                    variant={mode === 'dark' ? 'grey' : 'black'}
                    w='full'
                    onClick={() => {
                      toggleColorMode()
                      setLightTheme()
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
                    }}
                  >
                    <MoonIcon width={16} height={16} />
                  </Button>
                </HStack>
                <Button
                  variant='grey'
                  w='full'
                  onClick={() => {
                    trackClicked<ProfileBurgerMenuClickedMetadata>(
                      ClickEvent.ProfileBurgerMenuClicked,
                      {
                        option: 'Sign Out',
                      }
                    )
                    disconnectFromPlatform()
                    onToggleAuthMenu()
                  }}
                  justifyContent='flex-start'
                >
                  Log Out
                </Button>
              </MenuList>
            </Menu>
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
          <Box mt='16px' w='full'>
            <LoginButton />
          </Box>
        )}
        <Divider />
        {!isMobile && <CategoryFilter />}
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
          marginLeft: '188px',
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
    </>
  )
}
