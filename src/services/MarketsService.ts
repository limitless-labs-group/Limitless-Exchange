import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Market } from '@/types'
import { useMemo } from 'react'

export function useMarkets() {
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`)
      return response.data as Market[]
    },
  })

  return useMemo(() => markets ?? [], [markets])
}

export function useAllMarkets() {
  const { data: markets } = useQuery({
    queryKey: ['allMarkets'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets`)
      return response.data as Market[]
    },
  })

  return useMemo(() => markets ?? [], [markets])
}

export function useMarketByConditionId(conditionId: string) {
  const { data: market } = useQuery({
    queryKey: ['marketByConditionId', conditionId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/conditions/${conditionId}`
      )
      return response.data as Market
    },
  })

  return useMemo(() => market ?? null, [market])
}

export function useMarket(address?: string) {
  const { data: market } = useQuery({
    queryKey: ['market', address],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${address}`
      )
      return response.data as Market
    },
    enabled: !!address,
  })

  return useMemo(() => market ?? null, [market])
}
