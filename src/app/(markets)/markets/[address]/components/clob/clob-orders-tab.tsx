import { Button, HStack, Text } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import ButtonWithStates from '@/components/common/button-with-states'
import ClobOrdersTable from '@/components/common/markets/clob-widget/clob-orders-table'
import { ClobPositionType } from '@/app/(markets)/markets/[address]/components/clob/types'
import { useMarketOrders } from '@/hooks/use-market-orders'
import {
  ChangeEvent,
  ClickEvent,
  ClobPositionsTabChangesMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { controlsMedium, h3Regular } from '@/styles/fonts/fonts.styles'

interface ClobOrdersTabProps {
  marketType?: string
}

export default function ClobOrdersTab({ marketType }: ClobOrdersTabProps) {
  const { market } = useTradingService()
  const { trackChanged } = useAmplitude()
  const [positionsTab, setPositonsTab] = useState<ClobPositionType>(ClobPositionType.ALL)
  const { data: userOrders } = useMarketOrders(market?.slug)
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()
  const { trackClicked } = useAmplitude()

  const cancelAllOrdersMutation = useMutation({
    mutationKey: ['cancel-all-orders', market?.slug],
    mutationFn: async () => {
      trackClicked(ClickEvent.CancelAllOrdersClicked, {
        source: 'Market Page',
        value: '',
        marketAddress: market?.address,
        marketType: market?.marketType,
        tradeType: market?.tradeType,
      })
      await privateClient.delete(`/orders/all/${market?.slug}`)
    },
  })

  const onResetMutation = async () => {
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: ['user-orders', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['market-shares', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['order-book', market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['positions'],
      }),
    ])
    cancelAllOrdersMutation.reset()
  }

  return (
    <>
      <HStack w='full' justifyContent='space-between'>
        <HStack gap='16px'>
          <Text {...h3Regular}>Open Orders</Text>
          <HStack bg='grey.200' borderRadius='8px' py='2px' px={'2px'}>
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              py='2px'
              borderRadius='6px'
              bg={positionsTab === ClobPositionType.ALL ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor:
                  positionsTab === ClobPositionType.ALL ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              onClick={() => {
                trackChanged<ClobPositionsTabChangesMetadata>(ChangeEvent.ClobPositionsTabChanged, {
                  type: ClobPositionType.ALL,
                  marketAddress: market?.slug as string,
                })
                setPositonsTab(ClobPositionType.ALL)
              }}
            >
              <Text
                {...controlsMedium}
                color={positionsTab === ClobPositionType.ALL ? 'font' : 'fontLight'}
              >
                All
              </Text>
            </Button>
          </HStack>
        </HStack>
        {Boolean(userOrders?.length) && (
          <ButtonWithStates
            onReset={onResetMutation}
            status={cancelAllOrdersMutation.status}
            onClick={() => cancelAllOrdersMutation.mutateAsync()}
            variant='grey'
            w='82px'
          >
            Cancel all
          </ButtonWithStates>
        )}
      </HStack>
      <ClobOrdersTable marketType={marketType} />
    </>
  )
}
