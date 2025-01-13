import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PropsWithChildren, createContext, useContext } from 'react'
import { Token } from '@/types'

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
