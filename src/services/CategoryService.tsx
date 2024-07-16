import { Category } from '@/types'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`)
      return response.data as Category[]
    },
  })
