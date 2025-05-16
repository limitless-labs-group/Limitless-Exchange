'use client'

import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Loader from '@/components/common/loader'
import { Toast } from '@/components/common/toast'
import { AdminActionButton } from './atoms/action-button'
import { AdminMarketCard } from './market-card'
import { useToast } from '@/hooks/ui/useToast'
import { useUrlParams } from '@/hooks/use-url-param'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { DraftMarket } from '@/types/draft'

export const AdminRecentMarkets = () => {
  const toast = useToast()
  const { getParam } = useUrlParams()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [selectedMarkets, setSelectedMarkets] = useState<DraftMarket[]>([])

  const privateClient = useAxiosPrivateClient()
  const { data: recentMarkets, isLoading } = useQuery({
    queryKey: ['recentMarkets'],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts/recent`)
      return response.data
    },
    enabled: getParam('tab') === 'recent',
  })

  const toggleMarketSelection = (market: DraftMarket) => {
    setSelectedMarkets((prev) => {
      const exists = prev.find((m) => m.id === market.id)
      return exists ? prev.filter((m) => m.id !== market.id) : [...prev, market]
    })
  }

  const duplicateMarkets = async () => {
    setIsCreating(true)
    privateClient
      .post(`/markets/drafts/duplicate`, {
        marketsIds: selectedMarkets.map((m) => m.id),
      })
      .then(async (res) => {
        const id = toast({
          render: () => <Toast title={`Markets are duplicated`} id={id} />,
        })
        router.push('/adminka?tab=drafts')
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
          const isSelected = selectedMarkets.some((m) => m.id === market.id)
          return (
            <AdminMarketCard
              market={market}
              key={market.id}
              isChecked={isSelected}
              onToggle={() => toggleMarketSelection(market)}
            />
          )
        })}
        {isCreating ? (
          <Box width='full' display='flex' justifyContent='center' alignItems='center'>
            <Spinner />
          </Box>
        ) : null}

        {selectedMarkets.length > 0 ? (
          <AdminActionButton
            selectedMarkets={selectedMarkets}
            duplicateAction={duplicateMarkets}
            isLoading={isCreating}
          />
        ) : null}
      </VStack>
    </Flex>
  )
}
