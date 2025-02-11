import { Text, HStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { PropsWithChildren } from 'react'
import { formatUnits } from 'viem'
import ProgressBar from '@/components/common/progress-bar'
import { Tooltip } from '@/components/common/tooltip'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface OrdersTooltipProps {
  orders: ClobPosition[]
  decimals: number
  side: 'bid' | 'ask'
  placement: 'top-end' | 'top-start'
}

export default function OrdersTooltip({
  orders,
  decimals,
  children,
  side,
  placement,
}: PropsWithChildren<OrdersTooltipProps>) {
  const totalFilled = orders.reduce((acc, item) => {
    return new BigNumber(acc).plus(item.remainingSize).toString()
  }, '0')

  const originalSize = orders.reduce((acc, item) => {
    return new BigNumber(acc).plus(item.originalSize).toString()
  }, '0')

  const totalRemainingSize = new BigNumber(originalSize)
    .minus(new BigNumber(totalFilled))
    .toString()

  const filledPercentage = new BigNumber(totalRemainingSize)
    .dividedBy(new BigNumber(originalSize))
    .multipliedBy(100)
    .toNumber()

  const label = (
    <>
      <HStack w='160px' justifyContent='space-between' mb='8px'>
        <Text {...paragraphMedium}>Filled</Text>
        <Text>
          {NumberUtil.formatThousands(formatUnits(BigInt(totalRemainingSize), decimals), 0)}/
          {NumberUtil.formatThousands(formatUnits(BigInt(originalSize), decimals), 0)}
        </Text>
      </HStack>
      <ProgressBar value={filledPercentage} variant={side === 'ask' ? 'red' : 'green'} />
    </>
  )
  return (
    <Tooltip
      bg='background.90'
      border='unset'
      label={label}
      placement={placement}
      p='8px'
      rounded='8px'
    >
      {children}
    </Tooltip>
  )
}
