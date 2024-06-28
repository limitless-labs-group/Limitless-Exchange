import { useTheme, VStack } from '@chakra-ui/react'

export default function Sidebar() {
  const theme = useTheme()

  return (
    <VStack padding='16px' borderRight={`1px solid ${theme.colors.grey['200']}`} h='full'></VStack>
  )
}
