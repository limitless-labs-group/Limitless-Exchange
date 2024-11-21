import { Address, formatUnits, getContract, parseUnits } from 'viem'
import { fixedProductMarketMakerABI } from '@/contracts'
import { publicClient } from '@/providers'

export const calculateYesPotentialReturn = async (address: Address) => {
  let outcomeTokenAmountBI = 0n
  const fixedProductMarketMakerContract = getContract({
    address,
    abi: fixedProductMarketMakerABI,
    client: publicClient,
  })
  const collateralAmountBI = parseUnits('100', 6)
  outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
    collateralAmountBI,
    0,
  ])) as bigint
  const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, 6)
  const outcomeTokenPrice = +outcomeTokenAmount - 100
  return outcomeTokenPrice
}

export const calculateNoPotentialReturn = async (address: Address) => {
  let outcomeTokenAmountBI = 0n
  const fixedProductMarketMakerContract = getContract({
    address,
    abi: fixedProductMarketMakerABI,
    client: publicClient,
  })
  const collateralAmountBI = parseUnits('100', 6)
  outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcSellAmount([
    collateralAmountBI,
    0,
  ])) as bigint
  const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, 6)
  console.log(outcomeTokenAmount)
  const outcomeTokenPrice = +outcomeTokenAmount - 100
  return outcomeTokenPrice
}
