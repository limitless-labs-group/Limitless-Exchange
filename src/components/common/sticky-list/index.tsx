import { Box } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'

const StickyList = ({ elements }: { elements: React.ReactNode[] }) => {
  const [heights, setHeights] = useState<number[]>([])
  const elementRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const newHeights = elementRefs.current.map((el) => (el ? el.getBoundingClientRect().height : 0))
    setHeights(newHeights)
  }, [elements])

  // Function to calculate top position based on cumulative heights of previous elements
  const getTopPosition = (index: number) => {
    return heights.slice(0, index).reduce((acc, height) => acc + height, 30)
  }

  return elements?.map((el, index) => {
    return (
      <Box
        key={index}
        ref={(ref) => {
          elementRefs.current[index] = ref
        }}
        position='sticky'
        top={`${getTopPosition(index)}px`}
        width='100%'
        zIndex={10}
      >
        {el}
      </Box>
    )
  })
}

export default StickyList
