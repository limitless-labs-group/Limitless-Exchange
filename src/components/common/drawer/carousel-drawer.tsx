// components/DrawerCarousel.js
import { HStack } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Drawer } from 'vaul'
import Carousel from '@/components/common/carousel/carousel-mobile/carousel'
import MarketPage from '@/components/common/markets/market-page'
import MarketSlidePage from '@/components/common/markets/market-slide-page'
import DrawerArrowIcon from '@/resources/icons/drawer-arrow.svg'
import { useTradingService } from '@/services'
import { h1Regular, headline } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup } from '@/types'

type DrawerCarouselProps = {
  markets: Market[]
}

export default function DrawerCarousel({ markets }: DrawerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel()
  const drawerRef = useRef<HTMLButtonElement>(null)
  const [isDraggingUp, setIsDraggingUp] = useState(false)

  // Detecting drag direction on mobile
  const handleTouchMove = useCallback((e: any) => {
    const touch = e.touches[0]
    const yDirection = touch.clientY
    if (yDirection < 0) setIsDraggingUp(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (isDraggingUp) {
      drawerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      setIsDraggingUp(false)
    }
  }, [isDraggingUp])

  useEffect(() => {
    const drawerEl = drawerRef.current
    drawerEl?.addEventListener('touchmove', handleTouchMove)
    drawerEl?.addEventListener('touchend', handleTouchEnd)
    return () => {
      drawerEl?.removeEventListener('touchmove', handleTouchMove)
      drawerEl?.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchMove, handleTouchEnd])

  return (
    <Drawer.Root shouldScaleBackground onClose={close}>
      <Drawer.Trigger asChild>
        <button style={{ width: '100%' }} ref={drawerRef}>
          Click me
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 400,
          }}
        />
        <Drawer.Content
          style={{
            background: 'unset',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100dvh - 36px)',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 500,
            outline: 'none',
          }}
        >
          <div
            style={{
              flex: 1,
            }}
          >
            <HStack w='full' justifyContent='center'>
              <DrawerArrowIcon />
            </HStack>
            <div
              style={{
                margin: '0 auto',
                maxHeight: 'calc(100dvh - 68px)',
                width: '100%',
              }}
            >
              <Carousel
                slides={markets.map((market) => (
                  <MarketSlidePage key={market.expirationTimestamp} market={market} />
                ))}
              />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
