'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import StickyList from '@/components/common/sticky-list'
import { Toast } from '@/components/common/toast'
import { DraftMarket, DraftMarketCard } from '@/app/draft/queue/components/draft-card'
import { MainLayout } from '@/components'
import { useSortedItems } from '@/hooks/ui/use-sorted-items'
import { useToast } from '@/hooks/ui/useToast'

const RecentMarketsPage = () => {
  const router = useRouter()
  const toast = useToast()

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const { data: recentMarkets } = useQuery({
    queryKey: ['recentMarkets'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/drafts/recent`
      )
      return response.data
    },
  })

  const [selectedMarketIds, setSelectedMarketIds] = useState<number[]>([])

  const handleToggle = (marketId: number) => {
    setSelectedMarketIds((prevSelected) =>
      prevSelected.includes(marketId)
        ? prevSelected.filter((id) => id !== marketId)
        : [...prevSelected, marketId]
    )
  }

  const duplicateMarkets = () => {
    setIsCreating(true)
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/drafts/duplicate`, {
        marketsIds: selectedMarketIds,
      })
      .then((res) => {
        const id = toast({
          render: () => <Toast title={`Markets are duplicated`} id={id} />,
        })
        router.push('/draft/queue')
      })
      .catch((res) => {
        const id = toast({
          render: () => <Toast title={`Error: ${res.message}`} id={id} />,
        })
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  const { checkedItems, uncheckedItems } = useSortedItems({
    items: recentMarkets,
    condition: (market: DraftMarket) => selectedMarketIds.includes(market.id),
    render: (market: DraftMarket) => ({
      id: market.id,
      node: (
        <DraftMarketCard
          market={market}
          key={market.id}
          isChecked={selectedMarketIds.includes(market.id)}
          onToggle={() => handleToggle(market.id)}
        />
      ),
    }),
  })
  return (
    <MainLayout justifyContent={'center'}>
      <Flex justifyContent={'center'}>
        <VStack w='868px' spacing={4}>
          <StickyList elements={checkedItems} />
          {uncheckedItems?.map((element) => element.node)}
          {isCreating ? (
            <Box width='full' display='flex' justifyContent='center' alignItems='center'>
              <Spinner />
            </Box>
          ) : (
            <Button
              colorScheme='blue'
              w='full'
              position='sticky'
              bottom='10px'
              onClick={duplicateMarkets}
              disabled={isCreating || selectedMarketIds.length === 0}
            >
              Duplicate Markets to Queue
            </Button>
          )}
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default RecentMarketsPage
