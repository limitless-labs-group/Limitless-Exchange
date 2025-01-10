import { Text, Stack, HStack, Icon, Box } from '@chakra-ui/react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface TabButtonProps {
  isActive: boolean
  icon: React.ComponentType
  label: string
  onClick: () => void
}

export const TabButton: React.FC<TabButtonProps> = ({ isActive, icon, label, onClick }) => {
  return (
    <Stack cursor='pointer' onClick={onClick} mb='-1px' gap={0}>
      <HStack color={isActive ? 'grey.800' : 'grey.500'} px='8px' gap='4px' mb='4px'>
        <Icon as={icon} w='16px' h='16px' />
        <Text {...paragraphMedium} color={isActive ? 'grey.800' : 'grey.500'}>
          {label}
        </Text>
      </HStack>
      <Box w='full' h='3px' bg='grey.800' visibility={isActive ? 'visible' : 'hidden'} />
    </Stack>
  )
}
