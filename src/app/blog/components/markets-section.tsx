import { Box, HStack, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import CarouselDesktop from '@/components/common/carousel/carousel-desktop/carousel-desktop'
import MobileDrawer from '@/components/common/drawer'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import MarketPage from '@/components/common/markets/market-page'
import Skeleton from '@/components/common/skeleton'
import { useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { PostMarketSlug } from '@/types/blog'

interface MarketsSectionProps {
  slugs: PostMarketSlug[]
}

export default function MarketsSection({ slugs }: MarketsSectionProps) {
  const { onCloseMarketPage } = useTradingService()
  if (isMobile) {
    const cards = slugs.map((slug, index) => (
      <MobileDrawer
        key={slug.value}
        id={slug.value}
        trigger={
          <MarketSectionCard slug={slug.value} index={index} key={index} total={slugs.length} />
        }
        variant='black'
        onClose={onCloseMarketPage}
        renderPrevNext={true}
      >
        <MarketPage />
      </MobileDrawer>
    ))
    return <CarouselDesktop slides={cards} />
  }
  return (
    <VStack gap={0}>
      <HStack w='full' flexWrap='wrap' gap='8px'>
        {slugs.map((slug, index) => (
          <MarketSectionCard slug={slug.value} index={index} key={index} total={slugs.length} />
        ))}
      </HStack>
    </VStack>
  )
}

const MarketSectionCard = ({
  slug,
  index,
  total,
}: {
  slug: string
  index: number
  total: number
}) => {
  const { data, isLoading } = useMarket(slug)

  const analyticParams = {
    bannerPosition: index + 1,
    bannerPaginationPage: 1,
  }

  const variant = useMemo(() => {
    if (total === 1) {
      return data?.marketType === 'single' ? 'row' : 'groupRow'
    }
    return 'grid'
  }, [total, data])

  return (
    <Box flex='1 1 calc(50% - 8px)' minW='calc(50% - 8px)'>
      {isLoading || !data ? (
        <Box w='full'>
          <Skeleton height={180} />
        </Box>
      ) : (
        <Box
          sx={{
            'a > div:first-of-type': {
              height: data.marketType === 'single' ? '198px' : 'unset',
            },
          }}
        >
          <MarketCard market={data} variant={variant} analyticParams={analyticParams} />
        </Box>
      )}
    </Box>
  )
}
