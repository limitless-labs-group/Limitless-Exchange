import React, { createContext, useContext, useState, ReactNode, FC, useMemo } from 'react'
import { Dashboard, Category, Token } from '@/types'

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
    if (category) {
      setDashboard(undefined)
    }
  }

  const handleDashboard = (dashboard: Dashboard | undefined) => {
    setDashboard(dashboard)
    if (dashboard) {
      setSelectedCategory(undefined)
    }
  }

  const contextValue = useMemo(
    () => ({
      selectedFilterTokens,
      handleTokenChange,
      selectedCategory,
      handleCategory,
      dashboard,
      handleDashboard,
    }),
    [selectedFilterTokens, selectedCategory, dashboard]
  )

  return <TokenFilterContext.Provider value={contextValue}>{children}</TokenFilterContext.Provider>
}
