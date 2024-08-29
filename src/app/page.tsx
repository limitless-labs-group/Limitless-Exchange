'use client'
import { feedMockData } from '@/components/feed/utils'
import { Box, Button, Divider, HStack, VStack } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import FeedItem from '@/components/feed/components/feed-item'
import { v4 as uuidv4 } from 'uuid'
import { MainLayout } from '@/components'
import TextWithPixels from '@/components/common/text-with-pixels'
import { useEffect, useRef, useState } from 'react'

const data = feedMockData

export default function MainPage() {
  const [isFixed, setIsFixed] = useState(false)
  const buttonRef = useRef(null)

  const scrollOffset = isMobile ? 78 : 122

  useEffect(() => {
    const handleScroll = () => {
      if (buttonRef.current) {
        const value = window.scrollY + 28 <= scrollOffset ? scrollOffset : 28

        if (window.scrollY >= value) {
          setIsFixed(true)
          return
        } else {
          setIsFixed(false)
          return
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleLatestClicked = () => {
    window.scrollTo(0, 0)
  }

  return (
    <MainLayout isLoading={false}>
      <Box w={isMobile ? 'full' : '664px'} ml={isMobile ? 'auto' : '200px'}>
        <Divider bg='grey.800' orientation='horizontal' h='3px' mb='16px' />
        <TextWithPixels
          text={`Limitless Feed`}
          fontSize={'32px'}
          gap={2}
          userSelect='text'
          highlightWord={1}
        />
        <HStack justifyContent='center' w='full'>
          <Box
            ref={buttonRef}
            position={isFixed ? 'fixed' : 'absolute'}
            top={isFixed ? '28px' : scrollOffset}
            transform='translateX(-50%)'
            zIndex='1000'
          >
            <Button variant='contained' onClick={handleLatestClicked}>
              View Latest Posts
            </Button>
          </Box>
        </HStack>
        <VStack gap={isMobile ? 0 : '8px'} alignItems='baseline' mt={isMobile ? '44px' : '56px'}>
          {data.map((item) => (
            <FeedItem data={item as any} key={uuidv4()} />
          ))}
        </VStack>
      </Box>
    </MainLayout>
  )
}
