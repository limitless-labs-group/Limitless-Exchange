import { formatEther, formatUnits } from 'viem'

export function formatFixedEther(
  value: bigint,
  decimals: number,
  fractionDigits?: number,
  compact = false
) {
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    ...(compact ? { notation: 'compact' } : {}),
  }).format(Number(formatUnits(value, decimals)))
}
