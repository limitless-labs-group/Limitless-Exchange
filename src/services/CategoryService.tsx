import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'
import { Category } from '@/types'

const CATEGORIES_API_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`

export interface CategoryCountResponse {
  category: {
    [key: string]: number
  }
  totalCount: number
}

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${CATEGORIES_API_URL}/categories`)
  return response.data as Category[]
}

export const fetchCategoryCounts = async (): Promise<CategoryCountResponse> => {
  const response = await axios.get(`${CATEGORIES_API_URL}/markets/categories/count`)
  return response.data as CategoryCountResponse
}

export const useCategories = (enabled = true) => {
  const fetchCategoriesMemo = useMemo(() => fetchCategories, [])

  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesMemo,
    enabled,
  })
}

export const useCategoryCounts = () => {
  const fetchCategoryCountsMemo = useMemo(() => fetchCategoryCounts, [])

  return useQuery({
    queryKey: ['categoryCounts'],
    queryFn: fetchCategoryCountsMemo,
  })
}

export const useCategoriesWithCounts = () => {
  const categories = useCategories()
  const categoryCounts = useCategoryCounts()

  const combinedData = useMemo(() => {
    if (categories.data && categoryCounts.data) {
      return {
        categories: categories.data.map((category) => {
          const count = categoryCounts.data.category?.[category.id] || 0
          return {
            ...category,
            count,
          }
        }),
        totalCount: categoryCounts.data.totalCount || 0,
      }
    }
    return null
  }, [categories.data, categoryCounts.data])

  return {
    data: combinedData,
    isLoading: categories.isLoading || categoryCounts.isLoading,
    isError: categories.isError || categoryCounts.isError,
    error: categories.error || categoryCounts.error,
    refetch: () => {
      categories.refetch()
      categoryCounts.refetch()
    },
  }
}
