import { useEffect, useRef, useState } from 'react'

interface SnowBackgroundProps {
  width: number
  height: number
  isMoving: boolean
  numDots: number
}

const SnowBackground: React.FC<SnowBackgroundProps> = ({ width, height, isMoving, numDots }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [animationId, setAnimationId] = useState<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    // Create particles
    const particles: { x: number; y: number; radius: number; speed: number }[] = []
    const numParticles = numDots
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.3 + 0.5,
        speed: Math.random() * 2 + 0.1,
      })
    }

    const draw = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()

        if (true) {
          //condition for isMoving
          // Update particle position
          particle.y += particle.speed

          // Reset particle to top if it goes off-screen
          if (particle.y > canvas.height) {
            particle.y = -particle.radius
            particle.x = Math.random() * canvas.width
          }
        }
      })

      setAnimationId(requestAnimationFrame(draw))
    }

    draw()

    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [width, height])

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

export default SnowBackground
