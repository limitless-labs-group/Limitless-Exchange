import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

/**
 * Context type providing utility functions for currency conversion between USD and WETH (Wrapped Ethereum).
 */
type PriceOracleContextType = {
  /**
   * Converts a given amount in USD to its equivalent in WETH.
   * @param usd The amount in US dollars to be converted.
   * @returns The equivalent amount in Ethereum, or undefined if conversion is not possible.
   */
  convertUsdToWeth: (usd: number) => number | undefined

  /**
   * Converts a given amount in WETH to its equivalent in USD.
   * @param weth The amount in Wrapped Ethereum to be converted.
   * @returns The equivalent amount in US dollars, or undefined if conversion is not possible.
   */
  convertWethToUsd: (weth: number) => number | undefined
}

/**
 * Context for accessing price conversion functions between USD and WETH (Wrapped Ethereum).
 */
const PriceOracleContext = createContext<PriceOracleContextType | undefined>(undefined)

/**
 * Provides a React context provider for price conversions between USD and WETH.
 * This component fetches the current WETH price from an Coingecko API and provides functions to convert USD to WETH and vice versa.
 * @param children The child components to be rendered within this provider.
 */
export const PriceOracleProvider = ({ children }: React.PropsWithChildren) => {
  const [wethPrice, setWethPrice] = useState<number | undefined>(undefined)

  const fetchWethPrice = async () => {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=weth&vs_currencies=usd'
    )
    return data.weth.usd as number
  }

  const { data: fetchedWethPrice } = useQuery({
    queryKey: ['wethPrice'],
    queryFn: fetchWethPrice,
    staleTime: 1000 * 60 * 5, // Data life span 60 seconds
    refetchInterval: 1000 * 60 * 5, // Refetch data every 60 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (fetchedWethPrice !== undefined) {
      setWethPrice(fetchedWethPrice)
    }
  }, [fetchedWethPrice])

  const convertWethToUsd = (usd: number) => {
    if (!wethPrice) {
      return undefined
    }
    return usd / wethPrice
  }

  const convertUsdToWeth = (weth: number) => {
    if (!wethPrice) {
      return undefined
    }
    return weth * wethPrice
  }

  return (
    <PriceOracleContext.Provider value={{ convertUsdToWeth, convertWethToUsd }}>
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
 * const {convertUsdToWeth, convertWethToUsd} = usePriceOracle();
 * convertUsdToWeth(3500) ~= 1.1
 * convertWethToUsd(1.1) ~= 3500
 */
export const usePriceOracle = (): PriceOracleContextType => {
  const context = useContext(PriceOracleContext)
  if (context === undefined) {
    throw new Error('usePriceOracle must be used within a PriceOracleProvider')
  }
  return context
}
