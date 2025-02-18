import { limitlessApi, useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { LOGGED_IN_TO_LIMITLESS } from '@/utils/consts'

export default function useClient() {
  const privateClient = useAxiosPrivateClient()
  const isLogged = localStorage.getItem(LOGGED_IN_TO_LIMITLESS)

  return {
    isLogged,
    client: isLogged ? privateClient : limitlessApi,
  }
}
