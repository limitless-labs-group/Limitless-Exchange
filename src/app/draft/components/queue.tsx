'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Toast } from '@/components/common/toast'
import { DraftMarketCard } from '@/app/draft/components/draft-card'
import { SelectedMarkets } from './selected-markets'
import { useToast } from '@/hooks'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { DraftMarket, DraftMarketType } from '@/types/draft'

export type DraftMarketsQueueProps = {
  marketType?: DraftMarketType
  markets?: DraftMarket[]
}

export const DraftMarketsQueue = ({ marketType = 'amm', markets = [] }: DraftMarketsQueueProps) => {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const privateClient = useAxiosPrivateClient()

  const router = useRouter()

  const draftMarkets = markets

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
    router.push(`/draft/?draft-market=${marketId}&marketType=${marketType}`)
  }
  const getPostData = (marketType: DraftMarketType) => {
    switch (marketType) {
      case 'clob':
        return { url: `/markets/clob/create-batch`, ids: { marketsIds: selectedMarketIds } }
      case 'group':
        return { url: `/markets/group/create-batch`, ids: { groupIds: selectedMarketIds } }
      default:
        return { url: `/markets/create-batch`, ids: { marketsIds: selectedMarketIds } }
    }
  }
  const toast = useToast()

  const createMarketsBatch = () => {
    setIsCreating(true)
    const { url, ids } = getPostData(marketType)
    privateClient
      .post(
        url,
        { ...ids },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        if (res.status === 201 && marketType === 'amm') {
          const newTab = window.open('', '_blank')
          if (newTab) {
            newTab.location.href = res.data.multisigTxLink
          } else {
            // Fallback if the browser blocks the popup
            window.location.href = res.data.multisigTxLink
          }
        }
        const id = toast({
          render: () => <Toast title={`Created successfully`} id={id} />,
        })
      })
      .catch((res) => {
        const id = toast({
          render: () => <Toast title={`Error: ${res.message}`} id={id} />,
        })
      })
      .finally(async () => {
        await queryClient.refetchQueries({
          queryKey: ['allDraftMarkets'],
        })
        setSelectedMarketIds([])
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
              param='queue'
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
