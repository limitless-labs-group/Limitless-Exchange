import Cookies from 'js-cookie'
import { limitlessApi, useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export default function useClient() {
  const privateClient = useAxiosPrivateClient()
  const isLogged = localStorage.getItem('logged-to-limitless')
  const { web3Wallet } = useAccount()

  const checkIsLogged = () => Cookies.get('privy-token')

  return {
    isLogged,
    client: web3Wallet ? privateClient : limitlessApi,
    checkIsLogged,
  }
}
