import React from 'react'
import WreathsBronzeIcon from '@/resources/icons/wreaths_bronze.svg'
import WreathsGoldIcon from '@/resources/icons/wreaths_gold.svg'
import WreathsSilverIcon from '@/resources/icons/wreaths_silver.svg'

interface LeaderIconProps {
  index: number
}

export default function LeaderIcon({ index }: LeaderIconProps) {
  if (!index) {
    return <WreathsGoldIcon />
  }
  if (index === 1) {
    return <WreathsSilverIcon />
  }
  return <WreathsBronzeIcon />
}
