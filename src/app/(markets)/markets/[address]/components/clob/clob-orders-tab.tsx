import { Button, HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import ClobOrdersTable from '@/components/common/markets/clob-widget/clob-orders-table'
import { ClobPositionType } from '@/app/(markets)/markets/[address]/components/clob/types'
import {
  ChangeEvent,
  ClobPositionsTabChangesMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { controlsMedium, h3Regular } from '@/styles/fonts/fonts.styles'

export default function ClobOrdersTab() {
  const { market } = useTradingService()
  const { trackChanged } = useAmplitude()
  const [positionsTab, setPositonsTab] = useState<ClobPositionType>(ClobPositionType.ALL)

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
        <Button variant='grey'>Cancel all</Button>
      </HStack>
      <ClobOrdersTable />
    </>
  )
}
