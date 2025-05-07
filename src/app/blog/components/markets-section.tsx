import { Box, HStack } from '@chakra-ui/react'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import Skeleton from '@/components/common/skeleton'
import { useMarket } from '@/services/MarketsService'
import { PostMarketSlug } from '@/types/blog'

interface MarketsSectionProps {
  slugs: PostMarketSlug[]
}

export default function MarketsSection({ slugs }: MarketsSectionProps) {
  return (
    <HStack w='full'>
      {slugs.map((slug, index) => (
        <MarketSectionCard slug={slug.value} index={index} key={index} />
      ))}
    </HStack>
  )
}

const MarketSectionCard = ({ slug, index }: { slug: string; index: number }) => {
  const { data, isLoading } = useMarket(slug)

  const analyticParams = {
    bannerPosition: index + 1,
    bannerPaginationPage: 1,
  }

  return (
    <Box flex={1}>
      {isLoading || !data ? (
        <Box w='full'>
          <Skeleton height={180} />
        </Box>
      ) : (
        <MarketCard market={data} variant='grid' analyticParams={analyticParams} />
      )}
    </Box>
  )
}
