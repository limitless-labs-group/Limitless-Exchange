'use client'

import { CreateMarketCard, MainLayout, MarketCard } from '@/components'
import { defaultChain, markets } from '@/constants'
import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'

const MainPage = () => {
  return (
    <MainLayout>
      <Stack w={'full'} spacing={5}>
        <HStack spacing={5} fontWeight={'bold'} fontSize={'15px'}>
          <Stack>
            <Text>All</Text>
            <Box w={'full'} h={'3px'} bg={'font'} />
          </Stack>
          <Stack cursor={'not-allowed'}>
            <Text color={'fontLight'}>Crypto</Text>
            <Box w={'full'} h={'3px'} bg={'none'} />
          </Stack>
        </HStack>

        <Grid templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6}>
          <CreateMarketCard />

          {markets.map(
            (market) =>
              !market.closed && (
                <MarketCard
                  key={market.address[defaultChain.id]}
                  marketAddress={market.address[defaultChain.id]}
                />
              )
          )}
        </Grid>
      </Stack>
    </MainLayout>
  )
}

export default MainPage
