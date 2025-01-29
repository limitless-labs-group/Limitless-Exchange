import React, { createContext, useContext, useState, ReactNode, FC } from 'react'
import { Category, Token } from '@/types'

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

  selectedCategory: Category | undefined
  handleCategory: (category: Category | undefined) => void
}

export const TokenFilterProvider: FC<TokenFilterProviderProps> = ({ children }) => {
  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()

  const handleTokenChange = (tokens: Token[]) => {
    setSelectedFilterTokens(tokens)
  }

  const handleCategory = (category: Category | undefined) => {
    setSelectedCategory(category)
  }

  return (
    <TokenFilterContext.Provider
      value={{ selectedFilterTokens, handleTokenChange, selectedCategory, handleCategory }}
    >
      {children}
    </TokenFilterContext.Provider>
  )
}
