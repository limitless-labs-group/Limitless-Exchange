import { useToken } from '@chakra-ui/react'
import './skeleton.css'

interface SkeletonProps {
  height: number
}

export default function Skeleton({ height }: SkeletonProps) {
  const [grey300] = useToken('colors', ['grey.300'])
  return (
    <span
      className='skeleton'
      style={{
        height,
        width: '100%',
        transformOrigin: '0 100%',
        WebkitMaskImage: '-webkit-linear-gradient(white, white)',
        display: 'block',
        background: grey300,
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  )
}
