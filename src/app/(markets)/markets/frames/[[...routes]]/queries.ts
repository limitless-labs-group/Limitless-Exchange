import { Market, Token } from '@/types'
import { Address, createPublicClient, formatUnits, getContract, parseUnits } from 'viem'
import { defaultChain } from '@/constants'
import { fixedProductMarketMakerABI } from '@/contracts'
import { TradeQuotes } from '@/services'
import { http } from 'wagmi'

export function getViemClient() {
  const client = createPublicClient({
    transport: http(),
    chain: defaultChain,
  })

  return client
}

export const getQuote = async (
  market: Market,
  collateralAmount: string,
  decimals: number,
  outcomeTokenId: number,
  outcomeTokensBuyPercent: number[]
) => {
  const fixedProductMarketMakerContract = getContract({
    address: market.address as Address,
    abi: fixedProductMarketMakerABI,
    client: getViemClient(),
  })
  if (!fixedProductMarketMakerContract || !(Number(collateralAmount) > 0)) {
    return null
  }

  const collateralAmountBI = parseUnits(collateralAmount ?? '0', decimals)

  let outcomeTokenAmountBI
  outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
    collateralAmountBI,
    outcomeTokenId,
  ])) as bigint

  if (outcomeTokenAmountBI == BigInt(0)) {
    return null
  }

  const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, decimals)
  const outcomeTokenPrice = (Number(collateralAmount) / Number(outcomeTokenAmount)).toString()

  const roi = ((Number(outcomeTokenAmount) / Number(collateralAmount) - 1) * 100).toString()
  const priceImpact = Math.abs(
    Number(outcomeTokensBuyPercent[outcomeTokenId] - 1) / (Number(outcomeTokenPrice) * 100)
  ).toString()

  const quotes: TradeQuotes = {
    outcomeTokenPrice,
    outcomeTokenAmount,
    roi,
    priceImpact,
  }

  return quotes
}
