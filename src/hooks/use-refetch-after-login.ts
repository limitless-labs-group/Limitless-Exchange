import { useQueryClient } from '@tanstack/react-query'

export default function useRefetchAfterLogin() {
  const queryClient = useQueryClient()

  const refetchAll = async () => {
    await queryClient.refetchQueries({
      queryKey: ['feed'],
    })
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
    await queryClient.refetchQueries({
      queryKey: ['history-infinity'],
    })
  }

  return { refetchAll }
}
