import { Button, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface MarketClosedWidgetProps {
  handleCloseMarketPageClicked: () => void
}

export default function MarketClosedWidget({
  handleCloseMarketPageClicked,
}: MarketClosedWidgetProps) {
  const router = useRouter()

  return (
    <Paper h={'120px'}>
      <VStack h='full' justifyContent='space-between' alignItems='flex-start'>
        <Text {...paragraphMedium} color='grey.800'>
          Market is closed
        </Text>
        <Button
          variant='white'
          onClick={() => {
            if (!isMobile) {
              handleCloseMarketPageClicked()
            }
            router.push('/')
          }}
        >
          Explore Opened Markets
        </Button>
      </VStack>
    </Paper>
  )
}
