'use client'

import { Box, Button, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import Loader from '@/components/common/loader'
import { Toast } from '@/components/common/toast'
import { DraftMarketCard } from '@/app/draft/components/draft-card'
import { SelectedMarkets } from './selected-markets'
import { useToast } from '@/hooks/ui/useToast'
import { useUrlParams } from '@/hooks/use-url-param'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { DraftMarket } from '@/types/draft'

export const RecentMarkets = () => {
  const router = useRouter()
  const toast = useToast()
  const { getParam } = useUrlParams()
  const queryClient = useQueryClient()

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const privateClient = useAxiosPrivateClient()
  const { data: recentMarkets, isLoading } = useQuery({
    queryKey: ['recentMarkets'],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts/recent`)
      return response.data
    },
    enabled: getParam('tab') === 'recent',
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
      .then(async (res) => {
        const id = toast({
          render: () => <Toast title={`Markets are duplicated`} id={id} />,
        })

        const selectedMarketsTypes = recentMarkets
          .filter((market: DraftMarket) => selectedMarketIds.includes(market.id))
          .map((market: DraftMarket) => market.type)

        const hasAmm = selectedMarketsTypes.includes('amm')
        const type = hasAmm ? 'amm' : 'clob'
        router.push(`/draft?tab=queue-${type}`)
        await queryClient.invalidateQueries({ queryKey: ['allDraftMarkets'] })
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

  return isLoading ? (
    <VStack h='calc(100vh - 350px)' w='full' alignItems='center' justifyContent='center'>
      <Text {...paragraphMedium}>Fetching recent markets just for you!</Text>
      <Loader />
    </VStack>
  ) : (
    <Flex justifyContent={'center'} position='relative'>
      <VStack w='868px' spacing={4} mb='66px'>
        {recentMarkets?.map((market: DraftMarket) => {
          return (
            <DraftMarketCard
              market={market}
              key={market.id}
              isChecked={selectedMarketIds.includes(market.id)}
              onToggle={() => handleToggle(market.id)}
              withBadge
            />
          )
        })}
        {isCreating ? (
          <Box width='full' display='flex' justifyContent='center' alignItems='center'>
            <Spinner />
          </Box>
        ) : (
          <Box style={{ width: '100%', maxWidth: '868px', position: 'fixed', bottom: 20 }}>
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
      <Box
        position='fixed'
        right='24px'
        top='100px'
        maxWidth='350px'
        w='full'
        display={selectedMarket.length > 0 ? 'block' : 'none'}
      >
        <SelectedMarkets market={selectedMarket} />
      </Box>
    </Flex>
  )
}
