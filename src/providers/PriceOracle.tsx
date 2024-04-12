import React, { createContext, useContext, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

/**
 * Context type providing utility functions for currency conversion between USD and ETH (Ethereum).
 */
type PriceOracleContextType = {
  /**
   * Converts a given amount in USD to its equivalent in ETH.
   * @param usd The amount in US dollars to be converted.
   * @returns The equivalent amount in Ethereum, or 0 if conversion is not possible.
   */
  convertUsdToEth: (usd: number) => number

  /**
   * Converts a given amount in ETH to its equivalent in USD.
   * @param eth The amount in Ethereum to be converted.
   * @returns The equivalent amount in US dollars, or 0 if conversion is not possible.
   */
  convertEthToUsd: (eth: number) => number
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
  const fetchEthPrice = async () => {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    return data.ethereum.usd as number
  }

  const { data: ethPrice } = useQuery({
    queryKey: ['ethPrice'],
    queryFn: fetchEthPrice,
    staleTime: 1000 * 60 * 5, // Data life span 60 seconds
    refetchInterval: 1000 * 60 * 5, // Refetch data every 60 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const convertEthToUsd = useCallback(
    (eth: number) => {
      if (!ethPrice) {
        return 0
      }
      return eth * ethPrice
    },
    [ethPrice]
  )

  const convertUsdToEth = useCallback(
    (usd: number) => {
      if (!ethPrice) {
        return 0
      }
      return usd / ethPrice
    },
    [ethPrice]
  )

  return (
    <PriceOracleContext.Provider value={{ convertUsdToEth, convertEthToUsd }}>
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
