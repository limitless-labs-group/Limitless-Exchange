import axios from 'axios'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import CategoryLoader from './components/category-loader'
import CategoryMarketsPage from './components/markets'
import { Category, CategoryCountResponse } from '@/types'

async function fetchData() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

  try {
    const [categoriesRes, catCountRes] = await Promise.all([
      axios.get<Category[]>(`${baseUrl}/categories`, {}),
      axios.get<CategoryCountResponse>(`${baseUrl}/markets/categories/count`, {}),
    ])

    return {
      categories: categoriesRes.data,
      count: catCountRes.data,
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return { categories: [], count: { category: {}, totalCount: 0 } }
  }
}

function CategoryContent({
  matchedCategory,
  hasMarkets,
}: {
  matchedCategory: Category & { count: number }
  hasMarkets: boolean
}) {
  return (
    <div>
      {hasMarkets ? (
        <CategoryMarketsPage categoryId={matchedCategory.id} categoryName={matchedCategory.name} />
      ) : (
        <div className='container mx-auto py-10 text-center'>
          <h1 className='text-2xl font-bold mb-4'>
            No markets available in {matchedCategory.name}
          </h1>
          <p>Check back later for new prediction markets in this category.</p>
        </div>
      )}
    </div>
  )
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params

  return (
    <Suspense fallback={<CategoryLoader />}>
      <CategoryPageContent category={category} />
    </Suspense>
  )
}

async function CategoryPageContent({ category }: { category: string }) {
  const { categories, count } = await fetchData()

  const categoriesWithCount = categories.map((cat: Category) => ({
    ...cat,
    count: count.category[cat.id] || 0,
  }))

  const matchedCategory = categoriesWithCount.find(
    (cat) => cat.name.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
  )

  if (!matchedCategory) return notFound()

  const hasMarkets = matchedCategory.count > 0

  return <CategoryContent matchedCategory={matchedCategory} hasMarkets={hasMarkets} />
}
