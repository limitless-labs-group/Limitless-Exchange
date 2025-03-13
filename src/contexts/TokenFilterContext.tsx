import React, { createContext, useContext, useState, ReactNode, FC } from 'react'
import { Dashboard } from '@/atoms/dashboard'
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

  dashboard: Dashboard | undefined
  handleDashboard: (dashboard: Dashboard | undefined) => void
}

export const TokenFilterProvider: FC<TokenFilterProviderProps> = ({ children }) => {
  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()
  const [dashboard, setDashboard] = useState<Dashboard | undefined>()

  const handleTokenChange = (tokens: Token[]) => {
    setSelectedFilterTokens(tokens)
  }

  const handleCategory = (category: Category | undefined) => {
    setSelectedCategory(category)
    setDashboard(undefined)
  }
  const handleDashboard = (dashboard: Dashboard | undefined) => {
    setDashboard(dashboard)
    setSelectedCategory(undefined)
  }

  return (
    <TokenFilterContext.Provider
      value={{
        selectedFilterTokens,
        handleTokenChange,
        selectedCategory,
        handleCategory,
        dashboard,
        handleDashboard,
      }}
    >
      {children}
    </TokenFilterContext.Provider>
  )
}
