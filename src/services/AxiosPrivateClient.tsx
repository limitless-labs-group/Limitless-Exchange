import axios, { AxiosInstance } from 'axios'
import React, { createContext, useContext } from 'react'
import { getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import { useEtherspot } from './Etherspot'
import { useWeb3Service } from './Web3Service'
import { useWalletAddress } from '@/hooks/use-wallet-address'

const useSetupAxiosInstance = () => {
  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { client } = useWeb3Service()
  const account = useWalletAddress()

  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    withCredentials: true,
  })

  const getSigningMsg = async () => {
    return axiosInstance.get(`/auth/signing-message`)
  }
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const { data: registerProfileSigningMessage } = await getSigningMsg()

          if (!registerProfileSigningMessage) throw new Error('Failed to get signing message')

          const signature = (
            client === 'eoa'
              ? await signMessageAsync({ message: registerProfileSigningMessage, account })
              : await signMessage(registerProfileSigningMessage)
          ) as `0x${string}`

          const headers = {
            'content-type': 'application/json',
            'x-account': getAddress(
              client === 'eoa'
                ? (account as `0x${string}`)
                : (smartWalletExternallyOwnedAccountAddress as string)
            ),
            'x-signature': signature,
            'x-signing-message': toHex(String(registerProfileSigningMessage)),
          }

          try {
            await axiosInstance.post('/auth/login', { client }, { headers, withCredentials: true })
            return axiosInstance(originalRequest)
          } catch (e) {
            console.log('e', e)
          }
        } catch (reAuthError) {
          return Promise.reject(reAuthError)
        }
      }

      return Promise.reject(error)
    }
  )

  return axiosInstance
}

export default useSetupAxiosInstance

const AxiosContext = createContext<AxiosInstance | null>(null)

export const AxiosProvider = ({ children }: any) => {
  const axiosInstance = useSetupAxiosInstance()
  return <AxiosContext.Provider value={axiosInstance}>{children}</AxiosContext.Provider>
}

export const useAxiosPrivateClient = (): AxiosInstance => {
  const context = useContext(AxiosContext)
  if (!context) {
    throw new Error('useAxiosPrivateClient must be used within an AxiosProvider')
  }
  return context
}
