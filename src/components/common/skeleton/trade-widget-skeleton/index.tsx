import { useToken } from '@chakra-ui/react'
import './trade-widget-skeleton.css'

export enum SkeletonType {
  WIDGET_YES = 'widgetYes',
  WIDGET_NO = 'widgetNo',
  WIDGET_GREY = 'widgetGrey',
  DEFAULT = 'tradeSkeletonBackground',
}

interface SkeletonProps {
  height: number
  type?: SkeletonType
}

export default function TradeWidgetSkeleton({
  height,
  type = SkeletonType.DEFAULT,
}: SkeletonProps) {
  const getColor = (type: SkeletonType) => {
    switch (type) {
      case SkeletonType.WIDGET_YES:
        return 'skeleton.widgetYes'
      case SkeletonType.WIDGET_NO:
        return 'skeleton.widgetNo'
      case SkeletonType.WIDGET_GREY:
        return 'skeleton.widgetGrey'
      default:
        return 'skeleton.tradeSkeletonBackground'
    }
  }
  const [tradeSkeletonBackground] = useToken('colors', [getColor(type)])
  return (
    <span
      className={`tradeSkeleton ${type}`}
      style={{
        height,
        width: '100%',
        transformOrigin: '0 100%',
        WebkitMaskImage: '-webkit-linear-gradient(white, white)',
        display: 'block',
        background: tradeSkeletonBackground,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  )
}
