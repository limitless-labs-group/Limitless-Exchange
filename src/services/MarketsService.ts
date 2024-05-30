import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Market } from '@/types'

export function useMarkets() {
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets`)
      return response.data as Market[]
    },
  })

  return markets ?? []
}
