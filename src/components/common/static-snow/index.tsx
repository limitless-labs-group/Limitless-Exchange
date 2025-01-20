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

    // Scale the canvas for high DPI devices
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Helper function to generate a random number between 0 and max to avoid Math.random
    const getRandomNumber = (max: number) => {
      const array = new Uint32Array(1)
      window.crypto.getRandomValues(array)
      return (array[0] / (0xffffffff + 1)) * max
    }

    // Draw snowflakes
    for (let i = 0; i < numDots; i++) {
      const x = getRandomNumber(width)
      const y = getRandomNumber(height)

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
