'use client'

import {
  Text,
  Button,
  Flex,
  Spinner,
  VStack,
  useDisclosure,
  useToast,
  HStack,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { title } from 'process'
import { useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Modal } from '@/components/common/modals/modal'
import { Toast } from '@/components/common/toast'
import { AdminMarketCard } from './market-card'
import { Resolve, ResolveModal } from './resolve-modal'
import { useCreateMarketModal } from '@/hooks/use-create-market-modal'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useMarkets } from '@/services/MarketsService'
import { Market } from '@/types'

export interface LastOdds {
  marketId: number
  lastAvgPrice: string
  recommendedIndex: number
}

export const AdminActiveMarkets = () => {
  const { data, fetchNextPage, hasNextPage } = useMarkets(null, true, {
    'x-ignore-limits': 'true',
  })
  const { setMarket, open } = useCreateMarketModal()
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const toast = useToast()
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()

  const markets: Market[] = useMemo(() => {
    const allMarkets = data?.pages.flatMap((page) => page.data.markets) || []
    return allMarkets.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [data?.pages])

  const toggleMarketSelection = (market: Market) => {
    setSelectedMarkets((prev) => {
      const exists = prev.find((m) => m.id === market.id)
      return exists ? prev.filter((m) => m.id !== market.id) : [...prev, market]
    })
  }

  const handleClick = (market: Market) => {
    setMarket({
      id: market.slug,
      market,
      type: 'active',
      mode: 'edit',
      marketType: market.tradeType,
    })
    open()
  }

  interface ResolveMarketData {
    id: number
    title: string
    odds: string
    winningIndex: number
  }

  const [marketsToResolve, setMarketsToResolve] = useState<ResolveMarketData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const triggerResolveModal = async () => {
    const url = '/markets/last-odds-batch'
    const payload = { marketIds: selectedMarkets.map((m) => m.id) }

    try {
      const { data } = await privateClient.post<{ data: LastOdds[] }>(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      const marketsData = selectedMarkets.map((market) => {
        const marketData = data.data.find((item: LastOdds) => item.marketId === market.id)
        const odds = marketData ? (Number(marketData.lastAvgPrice) * 100).toString() : '0'
        const oddsValue = parseFloat(odds)
        const winningIndex = marketData ? marketData.recommendedIndex : oddsValue > 50 ? 1 : 0

        return {
          id: market.id,
          title: market.title,
          odds: oddsValue.toFixed(2),
          winningIndex: winningIndex,
        }
      })

      setMarketsToResolve(marketsData)
      setIsOpen(true)
    } catch (err: any) {
      const id = toast({ render: () => <Toast id={id} title={`Error: ${err.message}`} /> })
    } finally {
      await queryClient.refetchQueries({ queryKey: ['markets'] })
    }
  }

  const resolve = async (markets: Resolve[]) => {
    if (markets.length === 0 || selectedMarkets.length === 0) return

    const tradeTypes = [...new Set(selectedMarkets.map((m) => m.tradeType))]
    const marketTypes = [...new Set(selectedMarkets.map((m) => m.marketType))]

    const marketType = marketTypes[0] === 'group' ? 'group' : tradeTypes[0]

    if (marketTypes.length > 1 || tradeTypes.length > 1) {
      const id = toast({
        render: () => <Toast id={id} title='Error: Selected markets must be of the same type' />,
      })
      return
    }

    if (marketType === 'group' && selectedMarkets.length > 1) {
      const id = toast({
        render: () => (
          <Toast id={id} title='Error: Batch is not implemented for group. Select only 1 market.' />
        ),
      })
      return
    }

    const getUrl = () => {
      switch (marketType) {
        case 'clob':
          return `/markets/clob/propose/batch-resolve`
        case 'group':
          return `/markets/group/${selectedMarkets[0].id}/propose/resolve`
        case 'amm':
        default:
          return `markets/propose/batch-resolve`
      }
    }

    try {
      setIsLoading(true)
      const res = await privateClient.post(getUrl(), markets, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 200 || res.status === 201) {
        const newTab = window.open('', '_blank')
        if (newTab) {
          newTab.location.href = res.data.multisigTxLink
        } else {
          window.location.href = res.data.multisigTxLink
        }
      }
      setIsOpen(false)
      const id = toast({ render: () => <Toast id={id} title='Resolved successfully' /> })
    } catch (err: any) {
      const id = toast({ render: () => <Toast id={id} title={`Error: ${err.message}`} /> })
    } finally {
      await queryClient.refetchQueries({ queryKey: ['markets'] })
      setSelectedMarkets([])
      setIsLoading(false)
    }
  }

  return (
    <Flex justifyContent={'center'} position='relative'>
      <VStack w='868px' spacing={4} mb='66px'>
        <InfiniteScroll
          className='scroll'
          dataLength={markets?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
          loader={null}
        >
          {markets?.map((market: Market) => {
            const isSelected = selectedMarkets.some((m) => m.id === market.id)
            return (
              <AdminMarketCard
                market={market}
                key={market.id}
                isChecked={isSelected}
                onToggle={() => toggleMarketSelection(market)}
                onClick={() => handleClick(market)}
              />
            )
          })}
        </InfiniteScroll>

        {selectedMarkets.length > 0 ? (
          <Button
            colorScheme='blue'
            mt='16px'
            w='fit-content'
            onClick={triggerResolveModal}
            style={{ width: '100%', maxWidth: '868px', position: 'fixed', bottom: 20 }}
          >
            {'Resolve Selected Markets'}
          </Button>
        ) : null}
      </VStack>
      <Modal
        title='Market resolution'
        maxWidth='max-content'
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ResolveModal markets={marketsToResolve ?? []} onResolve={resolve} isLoading={isLoading} />
      </Modal>
    </Flex>
  )
}
