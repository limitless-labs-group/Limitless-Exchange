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

// TODO: incapsulate with context provider to reduce requests
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

  const { data: outcomeTokensPrice } = useQuery({
    queryKey: ['outcomeTokensPrice', marketMakerContract?.address],
    queryFn: async () => {
      if (!marketMakerContract) {
        return [0, 0]
      }

      const collateralAmount = `0.0000001`
      const collateralAmountBI = parseUnits(collateralAmount, collateralToken.decimals)
      const outcomeTokenAmountYesBI = (await marketMakerContract.read.calcBuyAmount([
        collateralAmountBI,
        0,
      ])) as bigint
      const outcomeTokenAmountNoBI = (await marketMakerContract.read.calcBuyAmount([
        collateralAmountBI,
        1,
      ])) as bigint
      const outcomeTokenAmountYes = formatUnits(outcomeTokenAmountYesBI, 18)
      const outcomeTokenAmountNo = formatUnits(outcomeTokenAmountNoBI, 18)
      const outcomeTokenPriceYes = Number(collateralAmount) / Number(outcomeTokenAmountYes)
      const outcomeTokenPriceNo = Number(collateralAmount) / Number(outcomeTokenAmountNo)

      console.log('outcomeTokensPrice', {
        priceYes: outcomeTokenPriceYes,
        priceNo: outcomeTokenPriceNo,
      })

      return [outcomeTokenPriceYes, outcomeTokenPriceNo]
    },
    // enabled: false,
  })

  const { data: outcomeTokensPercent } = useQuery({
    queryKey: ['outcomeTokensPercent', marketMakerContract?.address, outcomeTokensPrice],
    queryFn: async () => {
      if (!marketMakerContract || !outcomeTokensPrice) {
        return [50, 50]
      }

      const sum = outcomeTokensPrice[0] + outcomeTokensPrice[1]
      const outcomeTokensPercentYes = (outcomeTokensPrice[0] / sum) * 100
      const outcomeTokensPercentNo = (outcomeTokensPrice[1] / sum) * 100

      console.log('outcomeTokensPercent', {
        outcomeTokensPercentYes,
        outcomeTokensPercentNo,
      })

      return [outcomeTokensPercentYes, outcomeTokensPercentNo]
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
                funding
                holdersCount
              }
            }
          `,
        },
      })
      const [_marketData] = res.data.data?.[queryName] as MarketData[]
      const liquidity = formatUnits(BigInt(_marketData.funding), collateralToken.decimals)

      return {
        liquidity,
        holdersCount: _marketData.holdersCount,
      }
    },
    enabled: !!marketAddress,
  })

  return {
    outcomeTokensPrice,
    outcomeTokensPercent,
    ...liquidityAndHolders,
  }
}

type MarketData = {
  funding: string
  outcomePools?: string[]
  holdersCount: number
}
