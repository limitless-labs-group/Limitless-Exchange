import { VStack, Text } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import UserPlusIcon from '@/resources/icons/user-plus-icon.svg'
import { h3Regular, paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function NoInvitedFriendsSection() {
  return (
    <VStack w={isMobile ? 'full' : '336px'} mt='16px' justifyContent='center' mx='auto' gap={0}>
      <Paper p='16px'>
        <UserPlusIcon width={24} height={24} />
      </Paper>
      <Text {...h3Regular} mt='8px'>
        No one’s joined yet
      </Text>
      <Text {...paragraphMedium} color='grey.500' mt='4px' textAlign='center'>
        When someone signs up using your link, they’ll appear here—so you can see the impact you’re
        making.
      </Text>
    </VStack>
  )
}
