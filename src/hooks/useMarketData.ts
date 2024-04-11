import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { marketMakerABI } from '@/contracts'
import { publicClient } from '@/providers'
import { Market } from '@/types'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'
import { Address, formatUnits, getContract, parseUnits } from 'viem'

interface IUseMarketData {
  marketAddress?: Address
}

// TODO: incapsulate with context provider
export const useMarketData = ({ marketAddress }: IUseMarketData) => {
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) => market.address[defaultChain.id]?.toLowerCase() == marketAddress?.toLowerCase()
      ) ?? null,
    [marketAddress]
  )

  const marketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.address[defaultChain.id],
            abi: marketMakerABI,
            client: publicClient,
          })
        : null,
    [market]
  )

  const { data: sharesCost } = useQuery({
    queryKey: ['sharesCost', marketMakerContract?.address],
    queryFn: async () => {
      if (!marketMakerContract) {
        return [0, 0]
      }

      const oneToken = parseUnits(`1`, collateralToken.decimals)
      const netCostYesBI = (await marketMakerContract.read.calcNetCost([[oneToken, 0n]])) as bigint
      const netCostNoBI = (await marketMakerContract.read.calcNetCost([[0n, oneToken]])) as bigint
      const costYes = Number(formatUnits(netCostYesBI, collateralToken.decimals)) * 100
      const costNo = Number(formatUnits(netCostNoBI, collateralToken.decimals)) * 100

      console.log('sharesCost', {
        costYes,
        costNo,
      })

      return [costYes, costNo]
    },
    enabled: false,
  })

  const { data: sharesPercent } = useQuery({
    queryKey: ['sharesPercent', marketMakerContract?.address],
    queryFn: async () => {
      if (!marketMakerContract) {
        return [50, 50]
      }

      const totalMargin = 18.446 // ? contract constant

      const marginalPriceYesBI = (await marketMakerContract?.read.calcMarginalPrice([0])) as bigint
      const marginalPriceNoBI = (await marketMakerContract?.read.calcMarginalPrice([1])) as bigint
      const percentYes = (Number(formatUnits(marginalPriceYesBI, 18)) / totalMargin) * 100
      const percentNo = (Number(formatUnits(marginalPriceNoBI, 18)) / totalMargin) * 100

      console.log('sharesPercent', {
        percentYes,
        percentNo,
      })

      return [percentYes, percentNo]
    },
  })

  const { data: liquidityAndHolders } = useQuery({
    queryKey: ['marketData', marketAddress],
    queryFn: async () => {
      if (!marketAddress) {
        return
      }
      const queryName = 'automatedMarketMakers'
      const res = await axios.request({
        url: subgraphURI[defaultChain.id],
        method: 'post',
        data: {
          query: `
            query ${queryName} {
              ${queryName} (
                where: {id: "${marketAddress}"}
              ) {
                collateralPools
                holdersCount
              }
            }
          `,
        },
      })
      const [_marketData] = res.data.data?.[queryName] as MarketData[]
      let liquidity = 0
      _marketData.collateralPools.forEach((pool) => {
        liquidity += Number(formatUnits(BigInt(pool), collateralToken.decimals))
      })
      return {
        liquidity,
        holdersCount: _marketData.holdersCount,
      }
    },
    enabled: !!marketAddress,
  })

  return {
    sharesCost,
    sharesPercent,
    ...liquidityAndHolders,
  }
}

type MarketData = {
  collateralPools: string[]
  outcomePools?: string[]
  holdersCount: number
}
