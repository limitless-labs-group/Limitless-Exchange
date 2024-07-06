// src/contexts/TokenFilterContext.tsx
import React, { createContext, useContext, useState, ReactNode, FC } from 'react'
import { Token } from '@/types'

const TokenFilterContext = createContext<TokenFilterContextType | undefined>(undefined)

export const useTokenFilter = (): TokenFilterContextType => {
  const context = useContext(TokenFilterContext)
  if (!context) {
    throw new Error('useTokenFilter must be used within a TokenFilterProvider')
  }
  return context
}

interface TokenFilterProviderProps {
  children: ReactNode
}

interface TokenFilterContextType {
  selectedFilterTokens: Token[]
  handleTokenChange: (tokens: Token[]) => void
}

export const TokenFilterProvider: FC<TokenFilterProviderProps> = ({ children }) => {
  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])

  const handleTokenChange = (tokens: Token[]) => {
    setSelectedFilterTokens(tokens)
  }

  return (
    <TokenFilterContext.Provider value={{ selectedFilterTokens, handleTokenChange }}>
      {children}
    </TokenFilterContext.Provider>
  )
}
