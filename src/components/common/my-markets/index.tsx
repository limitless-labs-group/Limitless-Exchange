import { Box, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import MyMarketCard from '@/components/common/my-markets/components/my-market-card'
import Skeleton from '@/components/common/skeleton'
import useUserCreatedMarkets from '@/hooks/use-user-created-markets'
import { h3Bold } from '@/styles/fonts/fonts.styles'

export default function MyMarkets() {
  const { data: userMarkets, isLoading } = useUserCreatedMarkets()
  return (
    <Box
      borderRight='1px solid'
      borderColor='grey.100'
      w='400px'
      h='full'
      backdropFilter='blur(7.5px)'
      bg='background.80'
      p='16px'
      overflowY='scroll'
    >
      <Text {...h3Bold} textAlign='center'>
        My Markets
      </Text>
      <VStack mt='24px' gap='8px' w='full'>
        {isLoading
          ? [...Array(5)].map((index) => <Skeleton height={36} key={index} />)
          : userMarkets?.map((market, index) => <MyMarketCard key={index} market={market} />)}
      </VStack>
    </Box>
  )
}
