import Cookies from 'js-cookie'
import { limitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export default function useClient() {
  const privateClient = useAxiosPrivateClient()
  const isLogged = Cookies.get('logged-in-to-limitless')

  const checkIsLogged = () => Cookies.get('logged-in-to-limitless')

  return {
    isLogged,
    client: isLogged ? privateClient : limitlessApi,
    checkIsLogged,
  }
}
