'use client'

import { CreateMarketCard, MainLayout, MarketCard, MarketCardMobile } from '@/components'
import { defaultChain, markets } from '@/constants'
import { useIsMobile } from '@/hooks'
import { OpenEvent, useAmplitude } from '@/services'
import { Grid, Stack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Filter from '@/components/common/TokenFilter'
import { Token } from '@/types'
import { getAddress } from 'viem'

const MainPage = () => {
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened(OpenEvent.PageOpened, {
      page: 'Explore Markets',
    })
  }, [])

  /**
   * UI
   */
  const isMobile = useIsMobile()

  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])
  const handleSelectFilterTokens = (tokens: Token[]) => setSelectedFilterTokens(tokens)

  const marketsToShow = useMemo(() => {
    return markets
      .filter((market) => !market.expired)
      .filter((market) => !market.hidden[defaultChain.id])
      .filter((market) =>
        selectedFilterTokens.length > 0
          ? !!selectedFilterTokens.find(
              (filterToken) =>
                getAddress(filterToken.address[defaultChain.id]) ===
                getAddress(market.collateralToken[defaultChain.id])
            )
          : true
      )
  }, [selectedFilterTokens])

  return (
    <MainLayout maxContentWidth={'unset'}>
      <Stack w={'full'} spacing={5} px={{ md: 14 }}>
        <Filter onChange={handleSelectFilterTokens} />
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
