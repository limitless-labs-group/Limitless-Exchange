import { Box, Divider, useTheme, VStack, Text } from '@chakra-ui/react'
import React from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { LogInButton } from '@/components'

export default function Sidebar() {
  const theme = useTheme()
  const sportTags = ['All', 'Football', 'Basketball', 'AI', 'Politics', 'Movies']

  const politicsTags = ['All', 'WETH', 'ONCHAIN', 'DEGEN', 'MFER', 'HIGHER', 'USDC', 'VITA']

  const cryptoTags = ['All', 'WETH', 'ONCHAIN', 'DEGEN', 'MFER', 'HIGHER', 'USDC', 'VITA']
  const { isConnected } = useAccount()

  return (
    <VStack
      padding='16px'
      borderRight={`1px solid ${theme.colors.grey['200']}`}
      h='full'
      minW={'188px'}
      minH={'100vh'}
    >
      {!isConnected && <LogInButton h={'full'} />}
      <Image src={'/logo-black.svg'} height={32} width={156} alt='calendar' />
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
