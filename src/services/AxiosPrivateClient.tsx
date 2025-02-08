import { usePrivy, useWallets } from '@privy-io/react-auth'
import axios, { AxiosInstance } from 'axios'
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V06,
  providerToSmartAccountSigner,
} from 'permissionless'
import { signerToSafeSmartAccount } from 'permissionless/accounts'
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico'
import React, { createContext, useContext } from 'react'
import { getAddress, http, toHex } from 'viem'
import { defaultChain } from '@/constants'
import useRefetchAfterLogin from '@/hooks/use-refetch-after-login'
import { publicClient } from '@/providers/Privy'
import { bundlerClient, useAccount } from '@/services/AccountService'

const pimlicoRpcUrl = `https://api.pimlico.io/v2/84532/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

const pimlicoPaymaster = createPimlicoPaymasterClient({
  transport: http(pimlicoRpcUrl),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
})

const useSetupAxiosInstance = () => {
  const { signMessage, user } = usePrivy()
  const { refetchAll } = useRefetchAfterLogin()
  const { web3Wallet } = useAccount()
  const { wallets } = useWallets()

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

        const { data: signingMessage } = await axiosInstance.get(`/auth/signing-message`)
        if (!signingMessage) throw new Error('Failed to get signing message')

        let signature = ''

        let smartAccountAddress = ''

        if (client === 'eoa') {
          if (web3Wallet) {
            signature = await web3Wallet.signMessage(signingMessage)
          }
        }

        if (client === 'etherspot') {
          const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy')
          const provider = await embeddedWallet?.getEthereumProvider()
          //@ts-ignore
          const customSigner = await providerToSmartAccountSigner(provider)

          const safeSmartAccountClient = await signerToSafeSmartAccount(publicClient, {
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            signer: customSigner,
            safeVersion: '1.4.1',
            saltNonce: BigInt(0),
          })

          const smartAccountClient = createSmartAccountClient({
            account: safeSmartAccountClient,
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            chain: defaultChain,
            bundlerTransport: http(pimlicoRpcUrl, {
              timeout: 30_000,
            }),
            middleware: {
              gasPrice: async () => (await bundlerClient.getUserOperationGasPrice()).fast,
              sponsorUserOperation: pimlicoPaymaster.sponsorUserOperation,
            },
          })

          const { signature: smartWalletSignature } = await signMessage({
            message: signingMessage,
          })
          signature = smartWalletSignature
          smartAccountAddress = smartAccountClient.account.address
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
            ...(client === 'etherspot' ? { smartWallet: smartAccountAddress } : {}),
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
