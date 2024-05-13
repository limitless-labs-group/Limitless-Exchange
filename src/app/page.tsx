'use client'

import { CreateMarketCard, MainLayout, MarketCard, MarketCardMobile } from '@/components'
import { defaultChain, markets } from '@/constants'
import { useIsMobile } from '@/hooks'
import { OpenEvent, useAmplitude } from '@/services'
import { Grid, HStack, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const MainPage = () => {
  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened(OpenEvent.PageOpened, {
      page: 'Explore Markets',
    })
  }, [])

  const isMobile = useIsMobile()

  return (
    <MainLayout maxContentWidth={'unset'}>
      <Stack w={'full'} spacing={5} px={{ md: 14 }}>
        <HStack spacing={5} fontWeight={'bold'} fontSize={'15px'}></HStack>
        <Grid
          templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
          gap={6}
        >
          <CreateMarketCard />

          {markets.map(
            (market) =>
              !market.expired &&
              (isMobile ? (
                <MarketCardMobile key={uuidv4()} marketAddress={market.address[defaultChain.id]} />
              ) : (
                <MarketCard key={uuidv4()} marketAddress={market.address[defaultChain.id]} />
              ))
          )}
        </Grid>
      </Stack>
    </MainLayout>
  )
}

export default MainPage
