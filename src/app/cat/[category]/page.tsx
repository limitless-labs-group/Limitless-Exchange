import axios from 'axios'
import { notFound } from 'next/navigation'
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

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
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

  return (
    <div>
      {hasMarkets ? (
        <CategoryMarketsPage categoryId={matchedCategory.id} />
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
// import { dehydrate, QueryClient } from '@tanstack/react-query'
// import { HydrationBoundary } from '@tanstack/react-query'
// import axios, { AxiosResponse } from 'axios'
// import { notFound } from 'next/navigation'
// import CategoryMarketsPage from './components/markets'
// import {
//   Address,
//   ApiResponse,
//   Category,
//   CategoryCountResponse,
//   MarketPage,
//   OddsData,
// } from '@/types'
// import { calculateMarketPrice, getPrices } from '@/utils/market'
//
// const LIMIT_PER_PAGE = 20
//
// async function fetchInitialMarkets(categoryId: number): Promise<MarketPage> {
//   const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`
//   const marketBaseUrl = categoryId ? `${baseUrl}/${categoryId}` : baseUrl
//
//   console.log('this is server')
//
//   const { data: response }: AxiosResponse<ApiResponse> = await axios.get(marketBaseUrl, {
//     params: {
//       page: 1,
//       limit: LIMIT_PER_PAGE,
//     },
//   })
//
//   // const ammMarkets = response?.data?.filter((market) => market.tradeType === 'amm')
//   //
//   // const marketDataForMultiCall = ammMarkets?.map((market) => ({
//   //   address: market.address as Address,
//   //   decimals: market.collateralToken.decimals,
//   // }))
//   //
//   // const pricesResult =
//   //   ammMarkets && ammMarkets?.length > 0 ? await getPrices(marketDataForMultiCall) : []
//   //
//   // const _markets = new Map<`0x${string}`, OddsData>(
//   //   pricesResult.map((item) => [item.address, { prices: item.prices }])
//   // )
//
//   const result = response.data.map((market) => ({
//     ...market,
//     prices:
//       market.tradeType === 'amm'
//         ? // ? _markets.get(market.address as `0x${string}`)?.prices || [50, 50]
//           [50, 50]
//         : [calculateMarketPrice(market?.prices?.[0]), calculateMarketPrice(market?.prices?.[1])],
//   }))
//   console.log('ressu', result)
//
//   return {
//     data: {
//       markets: result,
//       totalAmount: response.totalMarketsCount,
//     },
//     next: 2,
//   }
// }
//
// async function fetchCategories() {
//   const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL
//
//   try {
//     const [categoriesRes, catCountRes] = await Promise.all([
//       axios.get<Category[]>(`${baseUrl}/categories`),
//       axios.get<CategoryCountResponse>(`${baseUrl}/markets/categories/count`),
//     ])
//
//     return {
//       categories: categoriesRes.data,
//       count: catCountRes.data,
//     }
//   } catch (error) {
//     console.error('Error fetching category data:', error)
//     return { categories: [], count: { category: {}, totalCount: 0 } }
//   }
// }
//
// export default async function CategoryPage({ params }: { params: { category: string } }) {
//   const { category } = params
//   const { categories, count } = await fetchCategories()
//
//   const categoriesWithCount = categories.map((cat: Category) => ({
//     ...cat,
//     count: count.category[cat.id] || 0,
//   }))
//
//   const matchedCategory = categoriesWithCount.find(
//     (cat) => cat.name.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
//   )
//
//   if (!matchedCategory) return notFound()
//
//   const queryClient = new QueryClient()
//
//   const queryKey = ['markets', matchedCategory.id]
//   const hasMarkets = matchedCategory.count > 0
//
//   if (hasMarkets) {
//     await queryClient.prefetchQuery({
//       queryKey,
//       queryFn: () => fetchInitialMarkets(matchedCategory.id),
//     })
//   }
//
//   const dehydratedState = dehydrate(queryClient)
//
//   return (
//     <HydrationBoundary state={dehydratedState}>
//       <CategoryMarketsPage categoryId={matchedCategory.id} />
//     </HydrationBoundary>
//   )
// }
