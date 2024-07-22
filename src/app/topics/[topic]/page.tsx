'use client'

import MainPage from '@/app/page'
import { useCategories } from '@/services'
import { useEffect, useState } from 'react'
import { Category } from '@/types'

const TopicPage = ({ params }: { params: { topic: string } }) => {
  const { data: categories } = useCategories()
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (categories && !category) {
      const targetCategory = categories.findLast(
        (category) => category?.name.toLowerCase() === params?.topic.toLowerCase()
      )
      setCategory(targetCategory ?? null)
    }
  }, [categories, params?.topic])

  return category && <MainPage params={category} />
}

export default TopicPage
