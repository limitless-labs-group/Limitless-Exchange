'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import StickyList from '@/components/common/sticky-list'
import { Toast } from '@/components/common/toast'
import { DraftMarket, DraftMarketCard } from '@/app/draft/queue/components/draft-card'
import { MainLayout } from '@/components'
import { useToast } from '@/hooks'
import { useSortedItems } from '@/hooks/ui/use-sorted-items'

const DraftMarketsQueuePage = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false)

  const router = useRouter()
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

  const handleClick = (marketId: number) => {
    router.push(`/draft/?market=${marketId}`)
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

  const { checkedItems, uncheckedItems } = useSortedItems({
    items: draftMarkets,
    condition: (market: DraftMarket) => selectedMarketIds.includes(market.id),
    render: (market: DraftMarket) => ({
      id: market.id,
      node: (
        <DraftMarketCard
          market={market}
          key={market.id}
          isChecked={selectedMarketIds.includes(market.id)}
          onToggle={() => handleToggle(market.id)}
          onClick={() => handleClick(market.id)}
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
              w={'full'}
              onClick={createMarketsBatch}
              style={{ position: 'sticky', bottom: 10 }}
            >
              Create Markets Batch
            </Button>
          )}
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default DraftMarketsQueuePage
