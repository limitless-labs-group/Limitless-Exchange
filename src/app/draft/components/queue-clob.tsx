'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Toast } from '@/components/common/toast'
import { DraftMarket, DraftMarketCard } from '@/app/draft/components/draft-card'
import { SelectedMarkets } from './selected-markets'
import { useToast } from '@/hooks'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { DraftMarketResponse } from '@/types/draft'

export const DraftMarketsQueueClob = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false)

  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()
  const toast = useToast()

  const router = useRouter()
  const { data: draftMarkets } = useQuery({
    queryKey: ['draftMarkets-clob'],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts`)

      return response.data.filter((market: DraftMarketResponse) => !!market.type)
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
    if (!draftMarkets || !Array.isArray(draftMarkets)) return []
    return draftMarkets
      ?.filter((market: DraftMarket) => selectedMarketIds.includes(market.id))
      .map((market: DraftMarket) => {
        return { title: market.title, id: market.id }
      })
  }, [selectedMarketIds, draftMarkets])

  const handleClick = (marketId: number) => {
    router.push(`/draft/?market=${marketId}`)
  }

  const createMarketsBatch = async () => {
    setIsCreating(true)
    privateClient
      .post(
        `/markets/clob/create-batch`,
        { marketsIds: selectedMarketIds },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(async (res) => {
        await queryClient.refetchQueries({
          queryKey: ['draftMarkets-clob'],
        })
        setSelectedMarketIds([])
        const id = toast({
          render: () => <Toast title={`Created successfully`} id={id} />,
        })
        // if (res.status === 201) {
        //   const newTab = window.open('', '_blank')
        //   if (newTab) {
        //     newTab.location.href = res.data.multisigTxLink
        //   } else {
        //     // Fallback if the browser blocks the popup
        //     window.location.href = res.data.multisigTxLink
        //   }
        // }
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
        {draftMarkets?.map((market: DraftMarket) => {
          return (
            <DraftMarketCard
              market={market}
              key={market.id}
              isChecked={selectedMarketIds.includes(market.id)}
              onToggle={() => handleToggle(market.id)}
              onClick={() => handleClick(market.id)}
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
            <Button colorScheme='green' mt='16px' w={'full'} onClick={createMarketsBatch}>
              Create Markets Batch
            </Button>
          </Box>
        )}
      </VStack>
    </Flex>
  )
}