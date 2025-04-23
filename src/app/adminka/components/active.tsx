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

export const AdminActiveMarkets = () => {
  const { data, fetchNextPage, hasNextPage } = useMarkets(null)
  const { setMarket, open } = useCreateMarketModal()
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const toast = useToast()
  const privateClient = useAxiosPrivateClient()

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

  const [marketsToResolve, setMarketsToResolve] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const triggerResolveModal = async () => {
    // setIsLoading(true)
    const url = '/markets/propose/winning-index'
    const payload = { marketsIds: selectedMarkets.map((m) => m.id) }

    const marketsData = selectedMarkets.map((market) => {
      const odds = Math.random() * 100

      return {
        id: market.id,
        title: market.title,
        odds: odds.toFixed(2),
        winningIndex: odds > 50 ? 1 : 0,
      }
    })
    setMarketsToResolve(marketsData)
    setIsOpen(true)
    // try {
    //   const res = await privateClient.post(url, payload, {
    //     headers: { 'Content-Type': 'application/json' },
    //   })
    //
    //   const marketsData = selectedMarkets.map((market) => {
    //     const marketData = res.data.find((item: any) => item.marketId === market.id)
    //     const odds = marketData ? marketData.odds : '0'
    //
    //     const oddsValue = parseFloat(odds)
    //     const formattedOdds = oddsValue.toFixed(2)
    //
    //     return {
    //       id: market.id,
    //       title: market.title,
    //       odds: formattedOdds,
    //       winningIndex: oddsValue > 50 ? 1 : 0, // Recommended winning index
    //     }
    //   })
    //
    //   setMarketsToResolve(marketsData)
    //   setIsOpen(true)
    // } catch (err: any) {
    //   const id = toast({ render: () => <Toast id={id} title={`Error: ${err.message}`} /> })
    // } finally {
    //   setIsLoading(false)
    // }
  }

  const resolve = async (markets: Resolve[]) => {
    if (markets.length === 0) return

    const marketTypes = [...new Set(selectedMarkets.map((m) => m.tradeType))]

    if (marketTypes.length > 1) {
      const id = toast({
        render: () => <Toast id={id} title='Error: Selected markets must be of the same type' />,
      })
      return
    }

    const marketType = marketTypes[0]

    let url = ''
    const payload = markets

    switch (marketType) {
      case 'clob':
        url = `/markets/clob/propose/batch-resolve`
        break
      // case 'group':
      //   url = `/markets/group/create-batch`
      //   payload = { groupIds: marketIds }
      //   break
      // default:
      //   url = `/markets/create-batch`
      //   payload = { marketsIds: marketIds }
      //   break
    }

    // setIsCreating(true)
    // url = `${marketIds[0]}/clob/propose/batch-resolve`
    try {
      console.log('payload', payload)
      // const res = await privateClient.post(url, payload, {
      //   headers: { 'Content-Type': 'application/json' },
      // })
      // console.log('res', res)

      // if (res.status === 201 && marketType === 'amm') {
      //   const newTab = window.open('', '_blank')
      //   if (newTab) {
      //     newTab.location.href = res.data.multisigTxLink
      //   } else {
      //     window.location.href = res.data.multisigTxLink
      //   }
      // }
      setIsOpen(false)
      const id = toast({ render: () => <Toast id={id} title='Created successfully' /> })
    } catch (err: any) {
      const id = toast({ render: () => <Toast id={id} title={`Error: ${err.message}`} /> })
    } finally {
      // await queryClient.refetchQueries({ queryKey: ['allDraftMarkets'] })
      setSelectedMarkets([])
      // setIsCreating(false)
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
            isDisabled={isLoading}
          >
            {isLoading ? <Spinner size='sm' mr={2} /> : null}
            {isLoading ? 'Loading...' : 'Resolve Selected Markets'}
          </Button>
        ) : null}
      </VStack>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ResolveModal markets={marketsToResolve ?? []} onResolve={resolve} />
      </Modal>
    </Flex>
  )
}

const mockMarkets = [
  {
    id: 1,
    title: 'Group market creator Test Limiltess -> CJ2',
    odds: '99',
    winningIndex: 1,
  },
  {
    id: 2,
    title: 'Clob market creator Test Limiltess -> CJ2',
    odds: '0.01',
    winningIndex: 0,
  },
  {
    id: 3,
    title: 'Amm market creator Test Limiltess -> CJ2',
    odds: '0.01',
    winningIndex: 0,
  },
]
