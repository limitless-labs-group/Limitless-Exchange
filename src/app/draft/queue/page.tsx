'use client'

import { MainLayout } from '@/components'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DraftMarketCard } from '@/app/draft/queue/components/draft-card'
import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'

const DraftMarketsQueuePage = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false)

  const { data: draftMarkets } = useQuery({
    queryKey: ['draftMarkets'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/drafts`)

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

  const toast = useToast()

  const createMarketsBatch = () => {
    setIsCreating(true)
    axios
      .post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/create-batch`,
        { marketsIds: selectedMarketIds },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        if (res.status === 201) {
          const newTab = window.open('', '_blank')
          if (newTab) {
            newTab.location.href = res.data.multisigTxLink
          } else {
            // Fallback if the browser blocks the popup
            window.location.href = res.data.multisigTxLink
          }
        }
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
          {draftMarkets &&
            draftMarkets.map((draftMarket: any) => (
              <DraftMarketCard
                market={draftMarket}
                key={draftMarket.id}
                isChecked={selectedMarketIds.includes(draftMarket.id)}
                onToggle={() => handleToggle(draftMarket.id)}
              />
            ))}
          {isCreating ? (
            <Box width='full' display='flex' justifyContent='center' alignItems='center'>
              <Spinner />
            </Box>
          ) : (
            <Button colorScheme='blue' w={'full'} onClick={createMarketsBatch}>
              Create Markets Batch
            </Button>
          )}
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default DraftMarketsQueuePage
