import { Address, Token } from '@/types'
import axios from 'axios'
import { PropsWithChildren, createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

interface ILimitlessApi {
  supportedTokens?: Token[]
}

export const limitlessApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
})

const LimitlessApiContext = createContext({} as ILimitlessApi)

export const useLimitlessApi = () => useContext(LimitlessApiContext)

export const LimitlessApiProvider = ({ children }: PropsWithChildren) => {
  const { data: supportedTokens } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await limitlessApi.get(`/tokens`)
      return response.data as Token[]
    },
  })

  const contextProviderValue: ILimitlessApi = { supportedTokens }

  return (
    <LimitlessApiContext.Provider value={contextProviderValue}>
      {children}
    </LimitlessApiContext.Provider>
  )
}

export class LimitlessApi {
  static predictionMarketBaseURI = 'https://pma-api.limitless.network'
  static gatewayBaseURI = 'https://gateway-api.limitless.network'

  static async getSigningMessage() {
    const res = await axios.post(`${this.gatewayBaseURI}/auth/signing-message`)
    const { SigningMessage: message } = res.data as { SigningMessage: string }
    return message
  }

  static async getFixedProductMarketMakerAddress() {
    const { data: fixedProductMarketMakerAddress } = await axios.get(
      `${this.predictionMarketBaseURI}/market-maker-address`
    )
    return fixedProductMarketMakerAddress as Address
  }
}
