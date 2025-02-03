import { Address, formatUnits, getContract, parseUnits } from 'viem'
import { fixedProductMarketMakerABI } from '@/contracts'
import { publicClient } from '@/providers/Privy'

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
  return +outcomeTokenAmount - 100
}

export const calculateNoPotentialReturn = async (address: Address) => {
  let outcomeTokenAmountBI = 0n
  const fixedProductMarketMakerContract = getContract({
    address,
    abi: fixedProductMarketMakerABI,
    client: publicClient,
  })
  const collateralAmountBI = parseUnits('100', 6)
  outcomeTokenAmountBI = (await fixedProductMarketMakerContract.read.calcBuyAmount([
    collateralAmountBI,
    1,
  ])) as bigint
  const outcomeTokenAmount = formatUnits(outcomeTokenAmountBI, 6)
  return +outcomeTokenAmount - 100
}
