import Cookies from 'js-cookie'
import { limitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export default function useClient() {
  const privateClient = useAxiosPrivateClient()
  const isLogged = Cookies.get('privy-token')

  const checkIsLogged = () => Cookies.get('privy-token')

  return {
    isLogged,
    client: isLogged ? privateClient : limitlessApi,
    checkIsLogged,
  }
}
