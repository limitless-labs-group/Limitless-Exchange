import { VStack, Text, Heading } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { h1Bold } from '@/styles/fonts/fonts.styles'

export const DashboardHeader = () => {
  if (isMobile) {
    return null
  }
  return (
    <VStack alignItems='start' gap='16px' justifyContent='center' width='inherit' maxW='976px'>
      <Text {...h1Bold} mt='43px' color='red.500'>
        Today,{' '}
        {new Date().toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        })}
      </Text>
      <Heading as='h1' fontSize=' 60px' fontStyle='normal' fontWeight='900' lineHeight='0.2'>
        Market watch {new Date().getFullYear()}
      </Heading>
    </VStack>
  )
}
