import { useQuery } from '@tanstack/react-query'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { PointsActionType } from '@/types'

export type PointsActions = {
  [K in keyof typeof PointsActionType]: boolean
}

export const usePointsActions = () => {
  const privateClient = useAxiosPrivateClient()
  return useQuery({
    queryKey: ['points-action'],
    queryFn: async () => {
      const response = await privateClient.get(`/points/actions`)
      return response.data
    },
  })
}
