import { Box, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MyMarketCard from '@/components/common/my-markets/components/my-market-card'
import Skeleton from '@/components/common/skeleton'
import useUserCreatedMarkets from '@/hooks/use-user-created-markets'
import { h3Bold, paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function MyMarkets() {
  const { data: userMarkets, isLoading } = useUserCreatedMarkets()

  const marketsData = useMemo(() => {
    if (!userMarkets?.length) {
      return <Text {...paragraphMedium}>No created markets yet</Text>
    }
    return userMarkets?.map((market, index) => <MyMarketCard key={index} market={market} />)
  }, [userMarkets])

  return (
    <Box
      borderRight={isMobile ? 'none' : '1px solid'}
      borderColor='grey.100'
      w={isMobile ? 'full' : '400px'}
      h='full'
      backdropFilter='blur(7.5px)'
      bg='whiteAlpha.50'
      p='16px'
      overflowY='scroll'
      mb={isMobile ? '40px' : 0}
    >
      <Text {...h3Bold} textAlign='center'>
        My Markets
      </Text>
      <VStack mt='24px' gap='8px' w='full'>
        {isLoading
          ? [...Array(5)].map((index) => <Skeleton height={36} key={index} />)
          : marketsData}
      </VStack>
    </Box>
  )
}
