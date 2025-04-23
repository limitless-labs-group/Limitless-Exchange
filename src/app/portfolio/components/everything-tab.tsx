import { useMemo } from 'react'
import PortfolioTabContainer from '@/app/portfolio/components/portfolio-tab-container'
import { usePosition } from '@/services'
import { MarketStatus } from '@/types'
import { PortfolioTab } from '@/types/portfolio'

export default function EverythingTab() {
  const { data: positions } = usePosition()

  const positionsFiltered = useMemo(() => {
    return positions?.positions
      .sort((a, b) => {
        const deadlineA = a.type === 'amm' ? a.market.expirationDate : a.market.deadline
        const deadlineB = b.type === 'amm' ? b.market.expirationDate : b.market.deadline
        return new Date(deadlineA).getTime() - new Date(deadlineB).getTime()
      })
      .sort((a, b) => {
        const isClosedA =
          //@ts-ignore
          a.type === 'amm' ? a.market.closed : a.market.status === MarketStatus.RESOLVED
        const isClosedB =
          //@ts-ignore
          b.type === 'amm' ? b.market.closed : b.market.status === MarketStatus.RESOLVED
        return isClosedA === isClosedB ? 0 : isClosedA ? -1 : 1
      })
  }, [positions])

  return (
    <PortfolioTabContainer
      type={PortfolioTab.FULL}
      noPositionsText='No positions were found.'
      positionsFiltered={positionsFiltered}
    />
  )
}
