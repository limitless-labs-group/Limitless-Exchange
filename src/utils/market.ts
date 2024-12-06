import BigNumber from 'bignumber.js'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { Address, formatUnits, parseUnits } from 'viem'
import { defaultChain } from '@/constants'
import { fixedProductMarketMakerABI } from '@/contracts'
import { OddsData } from '@/types'

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

export async function getPrices(data: { address: `0x${string}`; decimals: number }[]) {
  debugger
  const contractCallContext = data.map((market: { address: `0x${string}`; decimals: number }) => {
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

        const result = results.results[marketAddress].callsReturnContext
        const collateralDecimals = market.decimals
        const collateralAmount = collateralDecimals <= 6 ? '0.0001' : '0.0000001'
        console.log(result)

        if (!result[0].returnValues[0]?.hex || !result[1].returnValues[0]?.hex) {
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
      market: market.address,
      ...(markets.get(market.address) as OddsData),
    }
  })

  return result
}
