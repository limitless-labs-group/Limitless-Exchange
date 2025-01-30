import { Button, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import '@/app/style.css'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export function MarketClosedButton() {
  const router = useRouter()

  return (
    <>
      <Button
        variant='contained'
        w='full'
        mt='32px'
        h='48px'
        bg='black'
        justifyContent='space-between'
        onClick={() => router.push('/')}
        _hover={{
          bg: 'black',
        }}
      >
        Market is closed
        <Text {...paragraphMedium}>Explore Open Markets</Text>
      </Button>
    </>
  )
}
