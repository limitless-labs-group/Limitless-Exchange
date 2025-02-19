import { limitlessApi, useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { LOGGED_IN_TO_LIMITLESS } from '@/utils/consts'

export default function useClient() {
  const privateClient = useAxiosPrivateClient()
  const isLogged = localStorage.getItem(LOGGED_IN_TO_LIMITLESS)
  const { web3Wallet } = useAccount()

  return {
    isLogged,
    client: web3Wallet ? privateClient : limitlessApi,
  }
}
