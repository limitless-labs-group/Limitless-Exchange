'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Toast } from '@/components/common/toast'
import { DraftMarket, DraftMarketCard } from '@/app/draft/queue/components/draft-card'
import { MainLayout } from '@/components'
import { useToast } from '@/hooks/ui/useToast'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

const RecentMarketsPage = () => {
  const router = useRouter()
  const toast = useToast()

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const privateClient = useAxiosPrivateClient()
  const { data: recentMarkets } = useQuery({
    queryKey: ['recentMarkets'],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts/recent`)
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
    privateClient
      .post(`/markets/drafts/duplicate`, {
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

  return (
    <MainLayout justifyContent={'center'}>
      <Flex justifyContent={'center'}>
        <VStack w='868px' spacing={4}>
          {recentMarkets?.map((market: DraftMarket) => {
            return (
              <DraftMarketCard
                market={market}
                key={market.id}
                isChecked={selectedMarketIds.includes(market.id)}
                onToggle={() => handleToggle(market.id)}
              />
            )
          })}
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
