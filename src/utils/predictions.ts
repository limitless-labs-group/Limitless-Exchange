import { address } from '@metamask/abi-utils/dist/parsers'
import { Address, formatUnits, getContract, parseUnits } from 'viem'
import { fixedProductMarketMakerABI } from '@/contracts'
import { publicClient } from '@/providers'

// export function calculateYesPotentialReturn(
//   initialLiquidity: number,
//   yesPrice: number,
//   noPrice: number,
//   fee: number
// ) {
//   const remainingYes = (initialLiquidity * noPrice) / Math.max(yesPrice, noPrice)
//   const remainingNo = (initialLiquidity * yesPrice) / Math.max(yesPrice, noPrice)
//   const sendBackAmountYes = initialLiquidity - remainingYes
//   console.log(`sendBackAmountYes ${sendBackAmountYes}`)
//   const sendBackAmountNo = initialLiquidity - remainingNo
//   console.log(`sendBackAmountNo ${sendBackAmountNo}`)
//   const inventoryBalanceYes = initialLiquidity - sendBackAmountYes
//   console.log(`inventoryBalanceYes ${inventoryBalanceYes}`)
//   const inventoryBalanceNo = initialLiquidity - sendBackAmountNo
//   console.log(`inventoryBalanceNo ${inventoryBalanceNo}`)
//   const investmentAmountMinusFees = 100 - 100 * fee
//   console.log(`investmentAmountMinusFees ${investmentAmountMinusFees}`)
//   const endingOutcomeBalance =
//     (inventoryBalanceYes * inventoryBalanceNo) / (inventoryBalanceNo + investmentAmountMinusFees)
//   console.log(`endingOutcomeBalance ${endingOutcomeBalance}`)
//   const yesTokensAmount = inventoryBalanceYes + investmentAmountMinusFees - endingOutcomeBalance
//   console.log(`yesTokensAmount ${yesTokensAmount}`)
//   const potentialReturn = yesTokensAmount - 100
//   console.log(`potentialReturn ${potentialReturn}`)
//   return potentialReturn
// }

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
  const outcomeTokenPrice = (100 / Number(outcomeTokenAmount)).toString()
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
  const outcomeTokenPrice = (100 / Number(outcomeTokenAmount)).toString()
  return outcomeTokenPrice
}
