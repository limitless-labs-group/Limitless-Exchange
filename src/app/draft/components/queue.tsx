'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Toast } from '@/components/common/toast'
import { DraftMarket, DraftMarketCard } from '@/app/draft/components/draft-card'
import { SelectedMarkets } from './selected-markets'
import { useToast } from '@/hooks'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { DraftMarketResponse } from '@/types/draft'

export const DraftMarketsQueue = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false)

  const privateClient = useAxiosPrivateClient()

  const router = useRouter()
  const { data: draftMarkets } = useQuery({
    queryKey: ['draftMarkets-amm'],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts`)

      return response.data.filter(
        (market: DraftMarketResponse) => !market.type || market?.type === 'amm'
      )
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

  const toast = useToast()

  const createMarketsBatch = () => {
    setIsCreating(true)
    privateClient
      .post(
        `/markets/create-batch-palmera`,
        { marketsIds: selectedMarketIds },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      )
      .then((res) => {
        if (res.status === 200) {
          const blob = new Blob([res.data], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'batch-resolve-result.json' // Set the downloaded file name
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url) // Clean up memory
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
    <Flex justifyContent={'center'} position='relative'>
      <VStack w='868px' spacing={4} mb='66px'>
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
        <Button
          colorScheme='green'
          mt='16px'
          w={'full'}
          onClick={createMarketsBatch}
          style={{ width: '100%', maxWidth: '868px', position: 'fixed', bottom: 20 }}
          isDisabled={isCreating}
        >
          {isCreating ? <Spinner /> : 'Create Markets Batch'}
        </Button>
      </VStack>
      <Box
        position='fixed'
        right='24px'
        top='80px'
        maxWidth='350px'
        w='full'
        display={selectedMarket.length > 0 ? 'block' : 'none'}
      >
        <SelectedMarkets market={selectedMarket} />
      </Box>
    </Flex>
  )
}
