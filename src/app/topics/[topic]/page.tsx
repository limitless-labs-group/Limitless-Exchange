'use client'

import MainPage from '@/app/page'
import { useCategories } from '@/services'

const TopicPage = ({ params }: { params: { topic: string } }) => {
  const categories = useCategories()

  return (
    <MainPage
      params={
        categories.data?.findLast(
          (category) => category?.name.toLowerCase() === params?.topic.toLowerCase()
        ) ?? null
      }
    />
  )
}

export default TopicPage
