import { useQuery } from '@tanstack/react-query'
import { ContractCallContext, Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { defaultChain } from '@/constants'
import { fixedProductMarketMakerABI } from '@/contracts'
import { formatUnits, parseUnits } from 'viem'
import { limitlessApi } from '@/services'
import { AxiosResponse } from 'axios'
import { MarketGroup } from '@/types'

export default function useMarketGroup(slug: string) {
  return useQuery({
    queryKey: ['market-group', slug],
    queryFn: async () => {
      const { data: marketGroup }: AxiosResponse<MarketGroup> = await limitlessApi.get(
        `/markets-groups/${slug}`
      )

      const multicall = new Multicall({
        ethersProvider: new ethers.providers.JsonRpcProvider(
          defaultChain.rpcUrls.default.http.toString()
        ),
        tryAggregate: true,
        multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
      })

      const decimals = marketGroup.collateralToken.decimals

      const collateralAmount = decimals <= 6 ? `0.0001` : `0.0000001`
      const collateralAmountBI = parseUnits(collateralAmount, decimals)

      const contractCallContext: ContractCallContext[] = marketGroup.markets?.map((market) => {
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

      const results = await multicall.call(contractCallContext)

      const marketsWithPrices = marketGroup.markets
        .map((market) => {
          const marketAddress = market.address
          const result = results.results[marketAddress].callsReturnContext
          const outcomeTokenBuyAmountYesBI = BigInt(result[0].returnValues[0].hex)
          const outcomeTokenBuyAmountNoBI = BigInt(result[1].returnValues[0].hex)

          const outcomeTokenBuyAmountYes = formatUnits(
            outcomeTokenBuyAmountYesBI,
            // Todo change to market response decimals
            decimals
          )
          const outcomeTokenBuyAmountNo = formatUnits(
            outcomeTokenBuyAmountNoBI,
            // Todo change to market response decimals
            decimals
          )

          const outcomeTokenBuyPriceYes =
            Number(collateralAmount) / Number(outcomeTokenBuyAmountYes)
          const outcomeTokenBuyPriceNo = Number(collateralAmount) / Number(outcomeTokenBuyAmountNo)

          const buySum = outcomeTokenBuyPriceYes + outcomeTokenBuyPriceNo
          const outcomeTokensBuyPercentYes = +((outcomeTokenBuyPriceYes / buySum) * 100).toFixed(1)
          const outcomeTokensBuyPercentNo = +((outcomeTokenBuyPriceNo / buySum) * 100).toFixed(1)
          return {
            ...market,
            prices: [outcomeTokensBuyPercentYes, outcomeTokensBuyPercentNo],
          }
        })
        .sort((a, b) => b.prices[0] - a.prices[0])

      return {
        ...marketGroup,
        markets: marketsWithPrices,
      }
    },
    enabled: !!slug,
  })
}
