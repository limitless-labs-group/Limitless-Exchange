import { collateralToken, defaultChain, markets, subgraphURI } from '@/constants'
import { fixedProductMarketMakerABI } from '@/contracts'
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

  const fixedProductMarketMakerContract = useMemo(
    () =>
      market
        ? getContract({
            address: market.address[defaultChain.id],
            abi: fixedProductMarketMakerABI,
            client: publicClient,
          })
        : null,
    [market]
  )

  const { data: outcomeTokensBuyPrice } = useQuery({
    queryKey: ['outcomeTokensBuyPrice', fixedProductMarketMakerContract?.address],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract) {
        return [0, 0]
      }

      const collateralAmount = `0.0000001`
      const collateralAmountBI = parseUnits(collateralAmount, collateralToken.decimals)
      const outcomeTokenAmountYesBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
        collateralAmountBI,
        0,
      ])) as bigint
      const outcomeTokenAmountNoBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
        collateralAmountBI,
        1,
      ])) as bigint
      const outcomeTokenAmountYes = formatUnits(outcomeTokenAmountYesBI, 18)
      const outcomeTokenAmountNo = formatUnits(outcomeTokenAmountNoBI, 18)
      const outcomeTokenPriceYes = Number(collateralAmount) / Number(outcomeTokenAmountYes)
      const outcomeTokenPriceNo = Number(collateralAmount) / Number(outcomeTokenAmountNo)

      console.log('outcomeTokensBuyPrice', {
        priceYes: outcomeTokenPriceYes,
        priceNo: outcomeTokenPriceNo,
      })

      return [outcomeTokenPriceYes, outcomeTokenPriceNo]
    },
    // enabled: false,
  })

  const { data: outcomeTokensSellPrice } = useQuery({
    queryKey: ['outcomeTokensSellPrice', fixedProductMarketMakerContract?.address],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract) {
        return [0, 0]
      }

      const collateralAmount = `0.0000001`
      const collateralAmountBI = parseUnits(collateralAmount, collateralToken.decimals)
      const outcomeTokenAmountYesBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
        collateralAmountBI,
        0,
      ])) as bigint
      const outcomeTokenAmountNoBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
        collateralAmountBI,
        1,
      ])) as bigint
      const outcomeTokenAmountYes = formatUnits(outcomeTokenAmountYesBI, 18)
      const outcomeTokenAmountNo = formatUnits(outcomeTokenAmountNoBI, 18)
      const outcomeTokenPriceYes = Number(collateralAmount) / Number(outcomeTokenAmountYes)
      const outcomeTokenPriceNo = Number(collateralAmount) / Number(outcomeTokenAmountNo)

      console.log('outcomeTokensSellPrice', {
        priceYes: outcomeTokenPriceYes,
        priceNo: outcomeTokenPriceNo,
      })

      return [outcomeTokenPriceYes, outcomeTokenPriceNo]
    },
    // enabled: false,
  })

  const { data: outcomeTokensPercent } = useQuery({
    queryKey: [
      'outcomeTokensPercent',
      fixedProductMarketMakerContract?.address,
      outcomeTokensBuyPrice,
    ],
    queryFn: async () => {
      if (!fixedProductMarketMakerContract || !outcomeTokensBuyPrice) {
        return [50, 50]
      }

      const sum = outcomeTokensBuyPrice[0] + outcomeTokensBuyPrice[1]
      const outcomeTokensPercentYes = (outcomeTokensBuyPrice[0] / sum) * 100
      const outcomeTokensPercentNo = (outcomeTokensBuyPrice[1] / sum) * 100

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
    outcomeTokensBuyPrice,
    outcomeTokensSellPrice,
    outcomeTokensPercent,
    ...liquidityAndHolders,
  }
}

type MarketData = {
  funding: string
  outcomePools?: string[]
  holdersCount: number
}
