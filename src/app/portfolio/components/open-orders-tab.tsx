import { useMemo } from 'react'
import PortfolioTabContainer from '@/app/portfolio/components/portfolio-tab-container'
import { usePosition } from '@/services'
import { PortfolioTab } from '@/types/portfolio'

export default function OpenOrdersTab() {
  const { data: positions } = usePosition()
  const ordersFiltered = useMemo(() => {
    return positions?.positions
      .filter((position) => position.type === 'clob')
      .filter((position) => !!position.orders.liveOrders.length)
      .sort((a, b) => {
        return new Date(a.market.deadline).getTime() - new Date(b.market.deadline).getTime()
      })
  }, [positions])

  return (
    <PortfolioTabContainer
      type={PortfolioTab.ORDERS_ONLY}
      noPositionsText='No opened orders were found.'
      positionsFiltered={ordersFiltered}
    />
  )
}
