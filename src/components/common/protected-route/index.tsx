'use client'

import { Flex, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { useAccount } from '@/services'

interface ProtectedRouteProps {
  children: ReactNode
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  const { profileData, profileLoading, account } = useAccount()

  useEffect(() => {
    if (!profileLoading && !!profileData && profileData.isAdmin) {
      setIsAdmin(true)
    }
  }, [account, profileLoading])

  // temporary solution for redirecting non-admin users and guests.
  // refactoring with a token and middleware is required
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkIsAdmin(isAdmin)
    }, 2000)
    if (isAdmin) {
      clearTimeout(timeoutId)
    }
    return () => clearTimeout(timeoutId)
  }, [isAdmin, account, profileLoading])

  const checkIsAdmin = (admin: boolean) => {
    if (!admin) {
      router.push('/')
    }
  }

  if (!isAdmin)
    return (
      <Flex height='100vh' width='100vw' alignItems='center' justifyContent='center'>
        <Spinner />
      </Flex>
    )

  return <>{children}</>
}
