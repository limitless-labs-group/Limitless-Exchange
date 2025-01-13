import { usePrivy } from '@privy-io/react-auth'
import axios, { AxiosInstance } from 'axios'
import React, { createContext, useContext } from 'react'
import { getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import useRefetchAfterLogin from '@/hooks/use-refetch-after-login'
import { useAccount } from '@/services/AccountService'

const useSetupAxiosInstance = () => {
  const { signMessage, user } = usePrivy()
  const { signMessageAsync } = useSignMessage()
  const { smartAccountClient } = useAccount()
  const { refetchAll } = useRefetchAfterLogin()

  //avoid triggering signing message pop-up several times, when the few private requests will come simultaneously
  let signingPromise: Promise<void> | null = null
  const requestQueue: (() => Promise<unknown>)[] = []

  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    withCredentials: true,
  })

  const handleSigningProcess = async () => {
    if (signingPromise) return signingPromise

    signingPromise = (async () => {
      try {
        if (!user?.wallet?.address) throw new Error('Failed to get account')

        const client = user.wallet.connectorType === 'injected' ? 'eoa' : 'etherspot'

        if (client === 'etherspot' && !smartAccountClient) {
          return
        }

        const { data: signingMessage } = await axiosInstance.get(`/auth/signing-message`)
        if (!signingMessage) throw new Error('Failed to get signing message')

        let signature = ''
        if (client === 'eoa') {
          signature = await signMessageAsync({ message: signingMessage })
        } else {
          const { signature: smartWalletSignature } = await signMessage({
            message: signingMessage,
          })
          signature = smartWalletSignature
        }

        const headers = {
          'content-type': 'application/json',
          'x-account': getAddress(user.wallet.address),
          'x-signature': signature,
          'x-signing-message': toHex(String(signingMessage)),
        }

        await axiosInstance.post(
          '/auth/login',
          {
            client,
            ...(client === 'etherspot'
              ? { smartWallet: smartAccountClient?.account?.address }
              : {}),
          },
          { headers, withCredentials: true }
        )
        await refetchAll()
      } catch (error) {
        throw error
      } finally {
        signingPromise = null
      }
    })()

    return signingPromise
  }

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        return new Promise((resolve, reject) => {
          requestQueue.push(async () => axiosInstance(originalRequest).then(resolve).catch(reject))
          if (!signingPromise) {
            handleSigningProcess()
              .then(() => {
                const requests = [...requestQueue]
                requestQueue.length = 0
                Promise.allSettled(requests.map((req) => req())).then((results) => {
                  results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                      console.error(`Request ${index} failed:`, result.reason)
                    }
                  })
                })
              })
              .catch(() => {
                console.error('Signing process failed:', error)

                requestQueue.length = 0
              })
          }
        })
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
