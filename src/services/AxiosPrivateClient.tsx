import axios, { AxiosInstance } from 'axios'
import React, { createContext, useContext } from 'react'
import { getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import { useAccount as useWagmiAccount } from 'wagmi'
import { useEtherspot } from './Etherspot'
import { useWeb3Service } from './Web3Service'
import { useWeb3Auth } from '@/providers'

const useSetupAxiosInstance = () => {
  const { signMessage, smartWalletExternallyOwnedAccountAddress, smartWalletAddress } =
    useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { client } = useWeb3Service()
  const { web3Auth } = useWeb3Auth()
  const { address } = useWagmiAccount()

  //avoid triggering signing message pop-up several times, when the few private requests will come simultaneously
  let signingPromise: Promise<void> | null = null
  const requestQueue: (() => Promise<unknown>)[] = []

  const getAccount = () => {
    if (web3Auth.status === 'not_ready') {
      return
    }
    if (smartWalletAddress && smartWalletExternallyOwnedAccountAddress) {
      return smartWalletAddress
    }
    if (web3Auth.connectedAdapterName) {
      if (web3Auth.connectedAdapterName === 'openlogin' && !smartWalletAddress) {
        return
      }
    }
    return address
  }

  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    withCredentials: true,
  })

  const handleSigningProcess = async () => {
    if (signingPromise) return signingPromise

    signingPromise = (async () => {
      try {
        const account = getAccount()
        if (!account) throw new Error('Failed to get account')

        const { data: signingMessage } = await axiosInstance.get(`/auth/signing-message`)
        if (!signingMessage) throw new Error('Failed to get signing message')

        const signature = (
          client === 'eoa'
            ? await signMessageAsync({ message: signingMessage, account })
            : await signMessage(signingMessage)
        ) as `0x${string}`

        const headers = {
          'content-type': 'application/json',
          'x-account': getAddress(
            client === 'eoa'
              ? (account as `0x${string}`)
              : (smartWalletExternallyOwnedAccountAddress as string)
          ),
          'x-signature': signature,
          'x-signing-message': toHex(String(signingMessage)),
        }

        await axiosInstance.post('/auth/login', { client }, { headers, withCredentials: true })
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
