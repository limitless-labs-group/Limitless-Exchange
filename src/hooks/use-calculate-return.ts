import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { calculateNoPotentialReturn, calculateYesPotentialReturn } from '@/utils/predictions'

export function useCalculateYesReturn(address: Address, enabled: boolean) {
  return useQuery({
    queryKey: [address, 'yesReturn'],
    queryFn: async () => calculateYesPotentialReturn(address),
    enabled,
  })
}

export function useCalculateNoReturn(address: Address, enabled: boolean) {
  return useQuery({
    queryKey: [address, 'noReturn'],
    queryFn: async () => calculateNoPotentialReturn(address),
    enabled,
  })
}
