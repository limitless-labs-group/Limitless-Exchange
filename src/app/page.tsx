'use client'

import { CreateMarketCard, MainLayout, MarketCard, MarketCardMobile } from '@/components'
import { defaultChain, markets } from '@/constants'
import { useIsMobile } from '@/hooks'
import { OpenEvent, useAmplitude } from '@/services'
import { Grid, Stack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Filter from '@/components/common/TokenFilter'

const MainPage = () => {
  const { trackOpened } = useAmplitude()

  const [selectedFilterTokenId, setSelectedFilterTokenId] = useState<string>('')

  useEffect(() => {
    trackOpened(OpenEvent.PageOpened, {
      page: 'Explore Markets',
    })
  }, [])

  const isMobile = useIsMobile()

  const handleSelectFilterToken = (id: string) => setSelectedFilterTokenId(id)

  const marketsToShow = useMemo(() => {
    return markets
      .filter((market) => !market.expired)
      .filter((market) =>
        !!selectedFilterTokenId ? market.address[defaultChain.id] === selectedFilterTokenId : true
      )
  }, [selectedFilterTokenId])

  return (
    <MainLayout maxContentWidth={'unset'}>
      <Stack w={'full'} spacing={5} px={{ md: 14 }}>
        <Filter selectedId={selectedFilterTokenId} onSelect={handleSelectFilterToken} />
        <Grid
          templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
          gap={6}
        >
          <CreateMarketCard />
          {marketsToShow.map((market) =>
            isMobile ? (
              <MarketCardMobile key={uuidv4()} marketAddress={market.address[defaultChain.id]} />
            ) : (
              <MarketCard key={uuidv4()} marketAddress={market.address[defaultChain.id]} />
            )
          )}
        </Grid>
      </Stack>
    </MainLayout>
  )
}

export default MainPage
