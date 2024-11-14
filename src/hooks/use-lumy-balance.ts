import { useQuery } from '@tanstack/react-query'
import { useExternalWalletService } from '@/services/ExternalWalletService'

export function useLumyBalance() {
  const { checkLumyAccountBalance } = useExternalWalletService()
  return useQuery({
    queryKey: ['lumy-balance'],
    queryFn: checkLumyAccountBalance,
    refetchInterval: 60000,
  })
}
