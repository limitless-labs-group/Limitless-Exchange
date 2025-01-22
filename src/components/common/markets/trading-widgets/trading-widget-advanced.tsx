import React from 'react'
import ClobWidget from '@/components/common/markets/clob-widget/clob-widget'
import { ClobWidgetProvider } from '@/components/common/markets/clob-widget/context'

export default function TradingWidgetAdvanced() {
  return (
    <ClobWidgetProvider>
      <ClobWidget />
    </ClobWidgetProvider>
  )
}
