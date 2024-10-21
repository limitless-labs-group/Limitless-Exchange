import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { PropsWithChildren, createContext, useContext } from 'react'
import { Token } from '@/types'
import { ProfileActionType } from '@/types/profiles'

interface ILimitlessApi {
  supportedTokens?: Token[]
  getSigningMessage: (purpose: ProfileActionType) => Promise<AxiosResponse<string>>
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

  const getSigningMessage = async (purpose: ProfileActionType) => {
    return limitlessApi.get(`/profiles/signing-message/${purpose}`)
  }

  const contextProviderValue: ILimitlessApi = { supportedTokens, getSigningMessage }

  return (
    <LimitlessApiContext.Provider value={contextProviderValue}>
      {children}
    </LimitlessApiContext.Provider>
  )
}
