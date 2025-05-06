import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'
import { SelectOption } from '@/types/draft'

const createOption = (id: string, name: string): SelectOption => ({
  id,
  label: name,
  value: name,
})

export const useTags = (enabled = true) => {
  const fetchTags = useMemo(
    () => async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tags`)
      return response.data.map((tag: { id: string; name: string }) =>
        createOption(tag.id, tag.name)
      ) as SelectOption[]
    },
    []
  )

  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    enabled,
  })
}
