import { Box, BoxProps } from '@chakra-ui/react'
import { LegacyRef, PropsWithChildren, useEffect, useRef } from 'react'
import { isMobile } from 'react-device-detect'

export const SideBar = ({ children }: PropsWithChildren<BoxProps>) => {
  const scrollableBlockRef: LegacyRef<HTMLDivElement> | null = useRef(null)

  useEffect(() => {
    const handleMouseEnter = () => {
      document.body.style.overflow = 'hidden'
    }

    const handleMouseLeave = () => {
      document.body.style.overflow = ''
    }

    const scrollContainer = scrollableBlockRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', handleMouseEnter)
      scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      }
      document.body.style.overflow = '' // Clean up on unmount
    }
  }, [])
  return (
    <Box
      bg='grey.50'
      borderRight={isMobile ? 'unset' : '1px solid'}
      borderColor='grey.200'
      position={isMobile ? 'relative' : 'fixed'}
      height={isMobile ? 'calc(100dvh - 21px)' : '100vh'}
      top={isMobile ? '48px' : 0}
      left={0}
      overflowY='auto'
      p={isMobile ? '12px' : '16px'}
      pt={isMobile ? 0 : '16px'}
      mt='47px'
      ref={scrollableBlockRef}
      id='side-menu-scroll-container'
      // boxShadow={isMobile ? 'unset' : '-4px 0px 8px 0px rgba(0, 0, 0, 0.05)'}
      zIndex={3000}
      w={isMobile ? 'full' : '520px'}
    >
      {children}
    </Box>
  )
}
