import { useEffect, useRef } from 'react'

interface StaticSnowBackgroundProps {
  width: number
  height: number
  numDots: number
  dotRadius: number
}

const StaticSnowBackground: React.FC<StaticSnowBackgroundProps> = ({
  width,
  height,
  numDots,
  dotRadius,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    for (let i = 0; i < numDots; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
    }
  }, [width, height, numDots, dotRadius])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

export default StaticSnowBackground
