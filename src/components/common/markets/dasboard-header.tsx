import { VStack, Text, HStack } from '@chakra-ui/react'
import { h1Bold } from '@/styles/fonts/fonts.styles'

export const DashboardHeader = () => {
  return (
    <VStack alignItems='start' gap='16px' justifyContent='center' width='inherit' maxW='976px'>
      <Text {...h1Bold} mt='43px' color='red.500'>
        Today,{' '}
        {new Date().toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        })}
      </Text>
      <Text fontSize=' 60px' fontStyle='normal' fontWeight='900' lineHeight='0.2'>
        Market crash 2025
      </Text>
    </VStack>
  )
}
