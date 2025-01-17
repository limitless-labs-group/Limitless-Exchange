import { Box, Text } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import { useTradingService } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { ClobTradeEvent } from '@/types/orders'
import { NumberUtil, timeSinceCreation } from '@/utils'

interface ActivityClobItemProps {
  data: ClobTradeEvent
}

export default function ActivityClobItem({ data }: ActivityClobItemProps) {
  const { market } = useTradingService()
  const timePassed = timeSinceCreation(new Date(data.createdAt).getTime() / 1000)
  const text = useMemo(() => {
    const shares = NumberUtil.convertWithDenomination(
      formatUnits(BigInt(data.matchedSize), market?.collateralToken.decimals || 6).toString(),
      market?.collateralToken.decimals || 6,
      market?.collateralToken.symbol
    )
    const totalOrderPrice = new BigNumber(shares).multipliedBy(data.price).toString()
    return `${shares} shares were bought for ¢${data.price * 100} for ${totalOrderPrice} ${
      market?.collateralToken.symbol
    } in total.`
  }, [
    data.matchedSize,
    data.price,
    market?.collateralToken.decimals,
    market?.collateralToken.symbol,
  ])

  return (
    <Box
      py={isMobile ? '12px' : '8px'}
      borderTop='unset'
      sx={{
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'grey.300' },
      }}
      borderColor='grey.300'
      w='full'
    >
      <Text {...paragraphRegular} color='grey.500' mb='8px'>
        {timePassed}
      </Text>
      <Text {...paragraphMedium}>{text}</Text>
    </Box>
  )
}
