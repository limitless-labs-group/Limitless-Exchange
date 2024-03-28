import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { marketMakerABI } from '@/contracts'
import { publicClient } from '@/libs'
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

  const { data: sharesCost } = useQuery({
    queryKey: ['sharesCost', marketAddress],
    queryFn: async () => {
      if (!market) {
        return [0, 0]
      }
      const marketMakerContract = getContract({
        address: market.address[defaultChain.id],
        abi: marketMakerABI,
        client: publicClient,
      })

      const amount = parseUnits(`1`, collateralToken.decimals)
      const yesNetCostBI = (await marketMakerContract.read.calcNetCost([[amount, 0n]])) as bigint
      const noNetCostBI = (await marketMakerContract.read.calcNetCost([[0n, amount]])) as bigint
      const yesPrice = Number(formatUnits(yesNetCostBI, collateralToken.decimals)) * 100
      const noPrice = Number(formatUnits(noNetCostBI, collateralToken.decimals)) * 100

      console.log('sharesCost', {
        yesPrice,
        noPrice,
      })

      return [yesPrice, noPrice]
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
    ...liquidityAndHolders,
  }
}

type MarketData = {
  collateralPools: string[]
  outcomePools?: string[]
  holdersCount: number
}
