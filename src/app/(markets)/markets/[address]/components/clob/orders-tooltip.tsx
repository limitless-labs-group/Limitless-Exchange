import { Text, HStack, Button } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { PropsWithChildren, useState } from 'react'
import { formatUnits } from 'viem'
import ProgressBar from '@/components/common/progress-bar'
import { Tooltip } from '@/components/common/tooltip'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface OrdersTooltipProps {
  orders: ClobPosition[]
  decimals: number
  side: 'bid' | 'ask'
  placement: 'top-end' | 'top-start'
  onDelete: () => Promise<void>
}

export default function OrdersTooltip({
  orders,
  decimals,
  children,
  side,
  placement,
  onDelete,
}: PropsWithChildren<OrdersTooltipProps>) {
  const [hovered, setHovered] = useState(false)
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
          {NumberUtil.convertWithDenomination(formatUnits(BigInt(totalRemainingSize), decimals), 2)}
          /{NumberUtil.convertWithDenomination(formatUnits(BigInt(originalSize), decimals), 2)}
        </Text>
      </HStack>
      <ProgressBar value={filledPercentage} variant={side === 'ask' ? 'red' : 'green'} />
    </>
  )
  return (
    <Tooltip
      bg='transparent.70'
      border='unset'
      label={label}
      placement={placement}
      p='8px'
      rounded='8px'
    >
      <Button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        p={0}
        minW='16px'
        h='16px'
        color={side === 'bid' ? 'green.500' : 'red.500'}
        zIndex={200}
        onClick={onDelete}
      >
        {hovered ? <CloseIcon width={16} height={16} /> : children}
      </Button>
    </Tooltip>
  )
}
