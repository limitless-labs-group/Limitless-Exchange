import { limitlessApi, useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { LOGGED_IN_TO_LIMITLESS } from '@/utils/consts'

export default function useClient() {
  const privateClient = useAxiosPrivateClient()
  const isLoggedFully = localStorage.getItem(LOGGED_IN_TO_LIMITLESS) // logged with message sign
  const isLoggedToPlatform = localStorage.getItem('privy:token') // logged but didn't sign a message
  const { web3Wallet } = useAccount()

  const shouldUsePrivateClient = Boolean(isLoggedFully && web3Wallet !== undefined)

  return {
    isLogged: isLoggedFully,
    isLoggedToPlatform,
    client: shouldUsePrivateClient ? privateClient : limitlessApi,
  }
}
