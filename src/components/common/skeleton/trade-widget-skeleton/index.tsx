import { useToken } from '@chakra-ui/react'
import './trade-widget-skeleton.css'

interface SkeletonProps {
  height: number
}

export default function TradeWidgetSkeleton({ height }: SkeletonProps) {
  const [tradeSkeletonBackground] = useToken('colors', ['skeleton.tradeSkeletonBackground'])
  return (
    <span
      className='tradeSkeleton'
      style={{
        height,
        width: '100%',
        transformOrigin: '0 100%',
        WebkitMaskImage: '-webkit-linear-gradient(white, white)',
        display: 'block',
        background: tradeSkeletonBackground,
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  )
}
