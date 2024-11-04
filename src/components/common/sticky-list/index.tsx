import { Box } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'

type ElementWithId = {
  id: string | number
  node: React.ReactNode
}

const StickyList = ({ elements }: { elements: ElementWithId[] }) => {
  const [heights, setHeights] = useState<number[]>([])
  const elementRefs = useRef<Record<string | number, HTMLDivElement | null>>({})

  useEffect(() => {
    const newHeights = elements.map((el) => {
      const ref = elementRefs.current[el.id]
      return ref ? ref.getBoundingClientRect().height : 0
    })
    setHeights(newHeights)
  }, [elements])

  // Function to calculate top position based on cumulative heights of previous elements
  const getTopPosition = (index: number) => {
    return heights.slice(0, index).reduce((acc, height) => acc + height + 2, 30)
  }

  return elements?.map((el, index) => {
    return (
      <Box
        key={el.id}
        ref={(ref) => {
          elementRefs.current[el.id] = ref
        }}
        position='sticky'
        top={`${getTopPosition(index)}px`}
        width='100%'
        zIndex={10}
      >
        {el.node}
      </Box>
    )
  })
}

export default StickyList
