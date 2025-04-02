import { Text, VStack, HStack } from '@chakra-ui/react'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { paragraphRegular, captionRegular } from '@/styles/fonts/fonts.styles'
import { ChatMsg } from '.'
import Avatar from '../common/avatar'

export const Message = ({ comment }: { comment: ChatMsg }) => {
  return (
    <>
      <VStack w='full' gap='10px' align='start'>
        <HStack w='full' justifyContent='space-between'>
          <HStack>
            <Avatar account={comment.sender?.account ?? ''} avatarUrl={comment.sender?.pfpUrl} />
            <Text {...captionRegular}>
              {comment.sender?.displayName ?? comment.sender?.account ?? ''}
            </Text>
            <Text {...captionRegular} color='grey.500'>
              {useTimeAgo(comment.createdAt)}
            </Text>
          </HStack>
          {/* {isLoggedIn && ( */}
          {/*   <UserContextMenu */}
          {/*     username={comment.sender?.displayName ?? comment.sender?.account} */}
          {/*     userAccount={comment.sender?.account} */}
          {/*     setMessageBlocked={(arg) => console.log(arg)} */}
          {/*   /> */}
          {/* )} */}
        </HStack>
        <VStack gap='8px' align='start'>
          <Text {...paragraphRegular}>{comment.content}</Text>
        </VStack>
      </VStack>
      {/* <Divider /> */}
    </>
  )
}
