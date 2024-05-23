import React, { createContext, useContext, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { GetCoingeckoPricesResponse, MarketTokensIds } from '@/types'
import { QueryKeys } from '@/constants/query-keys'

/**
 * Context type providing utility functions for currency conversion between USD and ETH (Ethereum).
 */
type PriceOracleContextType = {
  marketTokensPrices: GetCoingeckoPricesResponse | undefined
  convertTokenAmountToUsd: (symbol?: string, amount?: number | string) => number
}

/**
 * Context for accessing price conversion functions between USD and ETH (Ethereum).
 */
const PriceOracleContext = createContext<PriceOracleContextType | undefined>(undefined)

/**
 * Provides a React context provider for price conversions between USD and ETH.
 * This component fetches the current ETH price from an Coingecko API and provides functions to convert USD to ETH and vice versa.
 * @param children The child components to be rendered within this provider.
 */
export const PriceOracleProvider = ({ children }: React.PropsWithChildren) => {
  // coingecko ids ethereum, degen-base, regen, higher, mfercoin, onchain

  const fetchTokenPrices = async () => {
    const { data }: AxiosResponse<GetCoingeckoPricesResponse> = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(MarketTokensIds).join(
        ','
      )}&vs_currencies=usd`
    )
    return data
  }

  // const fetchCoinsList = async () => {
  //   const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/list')
  //   console.info(data.filter((item: any) => item.name.toLowerCase().includes('degen')))
  //   return data
  // }

  const { data: marketTokensPrices } = useQuery({
    queryKey: [QueryKeys.TokenPrices],
    queryFn: fetchTokenPrices,
    staleTime: 1000 * 60 * 5, // Data life span 60 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // const { data } = useQuery({
  //   queryKey: ['coinlist'],
  //   queryFn: fetchCoinsList,
  //   staleTime: 1000 * 60 * 5, // Data life span 60 seconds
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  // })

  const convertTokenAmountToUsd = useCallback(
    (symbol?: string, amount?: number | string) => {
      if (!marketTokensPrices || !amount || isNaN(Number(amount)) || !symbol) {
        return 0
      }
      // @ts-ignore
      const coingeckoId = MarketTokensIds[symbol] as MarketTokensIds
      const amountUsd = Number(amount) * marketTokensPrices[coingeckoId]?.usd ?? 0
      return amountUsd
    },
    [marketTokensPrices]
  )

  return (
    <PriceOracleContext.Provider
      value={{
        marketTokensPrices,
        convertTokenAmountToUsd,
      }}
    >
      {children}
    </PriceOracleContext.Provider>
  )
}

/**
 * Custom React hook to access the PriceOracleContext.
 * Throws an error if used outside of a PriceOracleProvider.
 * @returns The PriceOracleContextType with conversion functions.
 *
 * @example
 * const {convertUsdToEth, convertEthToUsd} = usePriceOracle();
 * convertUsdToEth(3500) ~= 1.1
 * convertEthToUsd(1.1) ~= 3500
 */
export const usePriceOracle = (): PriceOracleContextType => {
  const context = useContext(PriceOracleContext)
  if (context === undefined) {
    throw new Error('usePriceOracle must be used within a PriceOracleProvider')
  }
  return context
}
