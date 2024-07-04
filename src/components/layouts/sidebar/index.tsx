import {
  Box,
  Divider,
  useTheme,
  VStack,
  Text,
  Button,
  HStack,
  Image as ChakraImage,
  Flex,
} from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import { LogInButton } from '@/components'
import {
  ClickEvent,
  CreateMarketClickedMetadata,
  useAmplitude,
  useBalanceService,
  useHistory,
  useAccount,
} from '@/services'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { useWalletAddress } from '@/hooks/use-wallet-address'

export default function Sidebar() {
  const theme = useTheme()
  const sportTags = ['All', 'Football', 'Basketball', 'AI', 'Politics', 'Movies']

  const politicsTags = ['All', 'WETH', 'ONCHAIN', 'DEGEN', 'MFER', 'HIGHER', 'USDC', 'VITA']

  const cryptoTags = ['All', 'WETH', 'ONCHAIN', 'DEGEN', 'MFER', 'HIGHER', 'USDC', 'VITA']
  const { isConnected } = useWagmiAccount()
  const { trackClicked } = useAmplitude()

  const { overallBalanceUsd } = useBalanceService()
  const { balanceInvested } = useHistory()
  const { userInfo } = useAccount()
  const address = useWalletAddress()

  const cutUsername = (username: string) => {
    if (username.length < 10) {
      return username
    }
    return `${username.slice(0, 10)}...`
  }

  return (
    <VStack
      padding='16px'
      borderRight={`1px solid ${theme.colors.grey['200']}`}
      h='full'
      minW={'188px'}
      minH={'100vh'}
    >
      <Image src={'/logo-black.svg'} height={32} width={156} alt='calendar' />
      {isConnected && (
        <VStack my='16px' w='full' gap='16px'>
          <HStack w='full'>
            <WalletIcon width={16} height={16} />
            <Text fontWeight={500}>{NumberUtil.formatThousands(overallBalanceUsd, 2)} USD</Text>
          </HStack>
          <HStack w='full'>
            <PortfolioIcon width={16} height={16} />
            <Text fontWeight={500}>{NumberUtil.formatThousands(balanceInvested, 2)} USD</Text>
          </HStack>
          <HStack w='full' justifyContent='space-between'>
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
              <Text>
                {userInfo?.name ? cutUsername(userInfo.name) : truncateEthAddress(address)}
              </Text>
            </HStack>
            <ChevronDownIcon width={16} height={16} />
          </HStack>
        </VStack>
      )}
      {isConnected ? (
        <Button
          variant='contained'
          bg='grey.300'
          color='black'
          w='full'
          h='unset'
          py='4px'
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
      <Box marginTop='20px' w='full'>
        <Text
          fontSize='12px'
          color={theme.colors.grey['600']}
          fontWeight='500'
          textTransform='uppercase'
          marginBottom='4px'
        >
          sport
        </Text>
        {sportTags.map((tag) => (
          <Box
            bg={theme.colors.grey['300']}
            padding='2px 4px'
            key={tag}
            borderRadius='2px'
            w='fit-content'
            marginBottom='4px'
            cursor='pointer'
          >
            <Text color={theme.colors.grey['800']} fontWeight={500}>
              /{tag}
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop='24px' w='full'>
        <Text
          fontSize='12px'
          color={theme.colors.grey['600']}
          fontWeight='500'
          textTransform='uppercase'
          marginBottom='4px'
        >
          politics
        </Text>
        {politicsTags.map((tag) => (
          <Box
            bg={theme.colors.grey['300']}
            padding='2px 4px'
            key={tag}
            borderRadius='2px'
            w='fit-content'
            marginBottom='4px'
            cursor='pointer'
          >
            <Text color={theme.colors.grey['800']} fontWeight={500}>
              /{tag}
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop='24px' w='full'>
        <Text
          fontSize='12px'
          color={theme.colors.grey['600']}
          fontWeight='500'
          textTransform='uppercase'
          marginBottom='4px'
        >
          crypto
        </Text>
        {cryptoTags.map((tag) => (
          <Box
            bg={theme.colors.grey['300']}
            padding='2px 4px'
            key={tag}
            borderRadius='2px'
            w='fit-content'
            marginBottom='4px'
            cursor='pointer'
          >
            <Text color={theme.colors.grey['800']} fontWeight={500}>
              /{tag}
            </Text>
          </Box>
        ))}
      </Box>
    </VStack>
  )
}
