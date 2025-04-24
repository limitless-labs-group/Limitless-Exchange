'use client'

import { Box, Button, Flex, Spinner, VStack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Toast } from '@/components/common/toast'
import { AdminMarketCard } from '@/app/adminka/components/market-card'
import { useToast } from '@/hooks'
import { useCreateMarketModal } from '@/hooks/use-create-market-modal'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { DraftMarket } from '@/types/draft'

export const AdminDraftMarkets = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState<DraftMarket[]>([])
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { open, setMarket } = useCreateMarketModal()

  const { data: draftMarkets = [] } = useQuery({
    queryKey: ['allDraftMarkets'],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts`)
      return response.data as DraftMarket[]
    },
  })

  const toggleMarketSelection = (market: DraftMarket) => {
    setSelectedMarkets((prev) => {
      const exists = prev.find((m) => m.id === market.id)
      return exists ? prev.filter((m) => m.id !== market.id) : [...prev, market]
    })
  }

  const handleClick = (market: DraftMarket) => {
    setMarket({
      id: market.id,
      market,
      type: 'draft',
      mode: 'edit',
      marketType: market.type,
    })
    open()
  }

  const createMarketsBatch = async () => {
    if (selectedMarkets.length === 0) return

    const marketTypes = [...new Set(selectedMarkets.map((m) => m.type))]

    if (marketTypes.length > 1) {
      const id = toast({
        render: () => <Toast id={id} title='Error: Selected markets must be of the same type' />,
      })
      return
    }

    const marketType = marketTypes[0]
    const marketIds = selectedMarkets.map((m) => m.id)

    let url = ''
    let payload = {}

    switch (marketType) {
      case 'clob':
        url = `/markets/clob/create-batch`
        payload = { marketsIds: marketIds }
        break
      case 'group':
        url = `/markets/group/create-batch`
        payload = { groupIds: marketIds }
        break
      default:
        url = `/markets/create-batch`
        payload = { marketsIds: marketIds }
        break
    }

    setIsCreating(true)
    try {
      const res = await privateClient.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status === 201 && marketType === 'amm') {
        const newTab = window.open('', '_blank')
        if (newTab) {
          newTab.location.href = res.data.multisigTxLink
        } else {
          window.location.href = res.data.multisigTxLink
        }
      }

      const id = toast({ render: () => <Toast id={id} title='Created successfully' /> })
    } catch (err: any) {
      const id = toast({ render: () => <Toast id={id} title={`Error: ${err.message}`} /> })
    } finally {
      await queryClient.refetchQueries({ queryKey: ['allDraftMarkets'] })
      setSelectedMarkets([])
      setIsCreating(false)
    }
  }

  return (
    <Flex justifyContent='center' position='relative'>
      <VStack w='868px' spacing={4} mb='66px'>
        {draftMarkets.map((market) => {
          const isSelected = selectedMarkets.some((m) => m.id === market.id)
          return (
            <AdminMarketCard
              key={market.id}
              market={market}
              isChecked={isSelected}
              onToggle={() => toggleMarketSelection(market)}
              onClick={() => handleClick(market)}
            />
          )
        })}

        {selectedMarkets.length > 0 && (
          <Button
            colorScheme='blue'
            mt='16px'
            w='fit-content'
            onClick={createMarketsBatch}
            style={{ width: '100%', maxWidth: '868px', position: 'fixed', bottom: 20 }}
            isDisabled={isCreating}
          >
            {isCreating ? <Spinner /> : 'Create Markets Batch'}
          </Button>
        )}
      </VStack>
    </Flex>
  )
}
