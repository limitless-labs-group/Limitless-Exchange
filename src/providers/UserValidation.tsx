import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { limitlessApi } from '@/services'

type UserValidationContextType = {
  userValidity: UserValidation | undefined
}

export type UserValidation = {
  valid: boolean
}

const UserValidationContext = createContext<UserValidationContextType | undefined>(undefined)

export const UserValidationProvider = ({ children }: React.PropsWithChildren) => {
  const { data: userValidity } = useQuery({
    queryKey: ['userValidity'],
    queryFn: async () => {
      const response = await limitlessApi.get(`/user-validation`)
      return response.data as UserValidation
    },
  })

  return (
    <UserValidationContext.Provider value={{ userValidity }}>
      {children}
    </UserValidationContext.Provider>
  )
}

export const useUserValidation = (): UserValidationContextType => {
  const context = useContext(UserValidationContext)
  if (context === undefined) {
    throw new Error('useUserValidation must be used within a UserValidationProvider')
  }
  return context
}
