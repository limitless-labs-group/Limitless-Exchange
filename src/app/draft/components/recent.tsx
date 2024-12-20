'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Toast } from '@/components/common/toast'
import { DraftMarket, DraftMarketCard } from '@/app/draft/components/draft-card'
import { SelectedMarkets } from './selected-markets'
import { useToast } from '@/hooks/ui/useToast'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export const RecentMarkets = () => {
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
  const selectedMarket = useMemo(() => {
    if (!recentMarkets || !Array.isArray(recentMarkets)) return []
    return recentMarkets
      ?.filter((market: DraftMarket) => selectedMarketIds.includes(market.id))
      .map((market: DraftMarket) => {
        return { title: market.title, id: market.id }
      })
  }, [selectedMarketIds, recentMarkets])

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
        router.push('/draft?tab=queue')
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
          <Box style={{ width: '100%', position: 'sticky', bottom: 40 }}>
            <SelectedMarkets market={selectedMarket} />
            <Button
              colorScheme='green'
              mt='16px'
              w={'full'}
              onClick={duplicateMarkets}
              disabled={isCreating || selectedMarketIds.length === 0}
            >
              Duplicate Markets to Queue
            </Button>
          </Box>
        )}
      </VStack>
    </Flex>
  )
}
