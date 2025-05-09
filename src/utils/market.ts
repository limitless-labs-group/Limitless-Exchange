import BigNumber from 'bignumber.js'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { Address, formatUnits, parseUnits } from 'viem'
import { defaultChain } from '@/constants'
import { LIMIT_PER_PAGE } from '@/constants/application'
import { fixedProductMarketMakerABI } from '@/contracts'
import { AnalyticsParams, OddsData } from '@/types'
import { MarketInput } from '@/types/draft'

export const getAnalyticsParams = (
  index: number,
  offset = 0,
  additionalParams?: Record<string, any>
): AnalyticsParams => {
  const position = index + 1 + offset
  return {
    bannerPosition: position,
    bannerPaginationPage: Math.floor((index + offset) / LIMIT_PER_PAGE) + 1,
    ...(additionalParams || {}),
  }
}

export const defineOpenInterestOverVolume = (
  openInterestFormatted: string,
  targetValue: string
) => {
  const isOpenInterestGreater = new BigNumber(openInterestFormatted).isGreaterThan(
    new BigNumber(targetValue)
  )
  return {
    value: isOpenInterestGreater ? openInterestFormatted : targetValue,
    showOpenInterest: isOpenInterestGreater,
  }
}

export const calculateMarketPrice = (price: number | undefined): number => {
  if (!price) return 50

  const calculated = new BigNumber(price).multipliedBy(100).decimalPlaces(0).toNumber()

  return Number.isNaN(calculated) ? 50 : calculated
}

export const findDuplicateMarketGroupTitles = (markets: MarketInput[]) => {
  const map = new Map()
  const duplicates = []
  const marketTitles = markets.map((market) => market.title)

  for (const str of marketTitles) {
    map.set(str, (map.get(str) || 0) + 1)
    if (map.get(str) === 2) {
      duplicates.push(str)
    }
  }

  return duplicates
}

export async function getPrices(data: { address: Address; decimals: number }[]) {
  const contractCallContext = data.map((market: { address: Address; decimals: number }) => {
    const collateralDecimals = market.decimals
    const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
    const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)

    return {
      reference: market.address,
      contractAddress: market.address,
      abi: fixedProductMarketMakerABI,
      calls: [
        {
          reference: 'calcBuyAmountYes',
          methodName: 'calcBuyAmount',
          methodParameters: [collateralAmountBI.toString(), 0],
        },
        {
          reference: 'calcBuyAmountNo',
          methodName: 'calcBuyAmount',
          methodParameters: [collateralAmountBI.toString(), 1],
        },
      ],
    }
  })

  const multicall = new Multicall({
    ethersProvider: new ethers.providers.JsonRpcProvider(
      defaultChain.rpcUrls.default.http.toString()
    ),
    multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
    tryAggregate: true,
  })

  const results = await multicall.call(contractCallContext)

  const markets: Map<Address, OddsData> = data.reduce(
    (acc, market: { address: string; decimals: number }) => {
      try {
        const marketAddress = market.address

        const marketResult = results.results[marketAddress]
        if (!marketResult) {
          console.error(`No result found for market ${marketAddress}`)
          return acc
        }

        const result = marketResult.callsReturnContext
        const collateralDecimals = market.decimals
        const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'

        if (!result[0]?.returnValues?.[0]?.hex || !result[1]?.returnValues?.[0]?.hex) {
          console.error(`Invalid return values for market ${marketAddress}`)
          return acc
        }

        const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues[0].hex)
        const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues[0].hex)

        const outcomeTokenBuyAmountYes = formatUnits(outcomeTokenBuyAmountYesBI, collateralDecimals)
        const outcomeTokenBuyAmountNo = formatUnits(outcomeTokenBuyAmountNoBI, collateralDecimals)

        if (Number(outcomeTokenBuyAmountYes) === 0 || Number(outcomeTokenBuyAmountNo) === 0) {
          return acc
        }

        const outcomeTokenBuyPriceYes = Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
        const outcomeTokenBuyPriceNo = Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)

        const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
        const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(1)
        const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)

        acc.set(marketAddress as Address, {
          prices: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
        })
      } catch (error) {
        console.error(`Error processing market ${market.address}:`, error)
      }

      return acc
    },
    new Map<Address, OddsData>()
  )
  const result = data.map((market: { address: `0x${string}`; decimals: number }) => {
    return {
      ...market,
      ...(markets.get(market.address)
        ? (markets.get(market.address) as OddsData)
        : { prices: [50, 50] }),
    }
  })

  return result
}

export const calculateDisplayRange = (
  outcome: number,
  adjustedMidpoint?: number,
  spread?: string
) => {
  const midpoint = new BigNumber(adjustedMidpoint || '0').multipliedBy(100)
  const midPointFormatted = outcome ? new BigNumber(100).minus(midpoint) : midpoint
  const lowerBound = midPointFormatted.minus(spread ? +spread * 100 : 5).decimalPlaces(1)
  const upperBound = midPointFormatted.plus(spread ? +spread * 100 : 5).decimalPlaces(1)
  return {
    lower: lowerBound.isNegative() ? '0' : lowerBound.toString(),
    upper: upperBound.isGreaterThan(100) ? '100' : upperBound.toString(),
  }
}

export const appendReferralCode = (url: string, referralCode: string): string => {
  try {
    const urlObj = new URL(url)

    if (urlObj.searchParams.has('rv')) {
      return url
    }

    urlObj.searchParams.set('rv', referralCode)
    return urlObj.toString()
  } catch (e) {
    // For invalid URLs, check manually if it already has an 'rv' parameter
    const hasRvParam = /[?&]rv=/.test(url)
    if (hasRvParam) {
      return url
    }
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}rv=${referralCode}`
  }
}
