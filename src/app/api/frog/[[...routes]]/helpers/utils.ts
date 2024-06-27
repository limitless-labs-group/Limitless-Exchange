import { formatUnits } from 'viem'

export function formatFixedEther(value: bigint, decimals: number, fractionDigits?: number) {
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
  }).format(Number(formatUnits(value, decimals)))
}
