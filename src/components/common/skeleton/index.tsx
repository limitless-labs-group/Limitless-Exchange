import { useToken } from '@chakra-ui/react'
import './skeleton.css'

interface SkeletonProps {
  height: number
}

export default function Skeleton({ height }: SkeletonProps) {
  const [skeletonDark] = useToken('colors', ['skeleton.dark'])
  return (
    <span
      className='skeleton'
      style={{
        height,
        width: '100%',
        transformOrigin: '0 100%',
        WebkitMaskImage: '-webkit-linear-gradient(white, white)',
        display: 'block',
        background: skeletonDark,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  )
}
