import { formatEther } from 'viem'

export function formatFixedEther(value: bigint, fractionDigits?: number) {
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
  }).format(Number(formatEther(value)))
}
