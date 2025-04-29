import { usePrivy } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Address, getAddress, toHex, WalletClient } from 'viem'
import useRefetchAfterLogin from '@/hooks/use-refetch-after-login'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Profile } from '@/types/profiles'
import { LOGGED_IN_TO_LIMITLESS, USER_ID } from '@/utils/consts'
import { useUrlParams } from '../use-url-param'

export interface IUseLogin {
  account?: Address
  client: 'etherspot' | 'eoa'
  smartWallet?: string
  r?: string
  web3Wallet: WalletClient | null
}

export const useLogin = () => {
  const { signMessage } = usePrivy()
  const { refetchAll } = useRefetchAfterLogin()
  const axiosInstance = useAxiosPrivateClient()
  const queryClient = useQueryClient()

  const getSigningMsg = async () => {
    return axiosInstance.get(`/auth/signing-message`)
  }
  const useParams = useUrlParams()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({
      client,
      account,
      smartWallet,
      r,
      web3Wallet,
    }: IUseLogin): Promise<Profile | undefined> => {
      const { data: loginSigningMessage } = await getSigningMsg()

      if (!loginSigningMessage) throw new Error('Failed to get signing message')
      let signature = ''
      if (client === 'eoa') {
        if (web3Wallet) {
          signature = await web3Wallet.signMessage({
            message: loginSigningMessage,
            account: web3Wallet.account?.address as Address,
          })
        }
      } else {
        const { signature: smartWalletSignature } = await signMessage({
          message: loginSigningMessage,
        })
        signature = smartWalletSignature
      }

      const headers = {
        'x-account': getAddress(account as Address),
        'x-signature': signature,
        'x-signing-message': toHex(String(loginSigningMessage)),
      }

      try {
        const res = await axiosInstance.post(
          '/auth/login',
          { client, smartWallet, r },
          {
            headers,
          }
        )
        localStorage.setItem(LOGGED_IN_TO_LIMITLESS, 'true')
        localStorage.setItem(USER_ID, res.data.id)
        await refetchAll()
        return res.data as Profile
      } finally {
        useParams.updateParams({ r: null })
      }
    },
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(['profiles', { account: variables.account }], updatedData)
    },
    // onError: () => {
    //   const id = toast({ render: () => <Toast id={id} title='Failed to register profile' /> })
    // },
  })
}
