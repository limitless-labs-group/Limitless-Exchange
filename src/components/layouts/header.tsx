import { HStack } from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import { useThemeProvider } from '@/providers'

export default function Header() {
  const { setLightTheme, setDarkTheme, mode } = useThemeProvider()
  return (
    <HStack w='full' justifyContent='space-between' p='16px'>
      <HStack gap='32px'>
        <Image
          src={mode === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
          height={32}
          width={114}
          alt='logo'
        />
      </HStack>
    </HStack>
  )
}
