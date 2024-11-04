import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'
import { Category } from '@/types'

export const useCategories = () => {
  const fetchCategories = useMemo(
    () => async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`)
      return response.data as Category[]
    },
    []
  )

  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}
