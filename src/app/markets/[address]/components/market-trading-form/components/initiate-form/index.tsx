import { CircularProgress, CircularProgressLabel, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

export default function InitiateForm() {
  const [timer, setTimer] = useState(5)
  const id = useRef<number | null>(null)

  useEffect(() => {
    id.current = window.setInterval(() => {
      setTimer((time) => time - 1)
    }, 1000)
    return () => clearInterval(id.current as number)
  }, [])

  useEffect(() => {
    if (timer === 0) {
      clearInterval(id.current as number)
    }
  }, [timer])

  const progress = timer * 20

  return (
    <VStack mt='88px' w='full'>
      <CircularProgress
        value={100 - progress}
        size='40px'
        color='white'
        trackColor='rgba(255, 255, 255, 0.2)'
      >
        <CircularProgressLabel color='white' fontWeight={500} fontSize='14px'>
          {timer}
        </CircularProgressLabel>
      </CircularProgress>
    </VStack>
  )
}
