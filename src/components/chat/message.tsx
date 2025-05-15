import { Text, VStack, HStack } from '@chakra-ui/react'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { paragraphRegular, captionRegular } from '@/styles/fonts/fonts.styles'
import { ChatMsg } from '.'
import Avatar from '../common/avatar'

export const trimAcc = (str: string): string => {
  if (!str || str.length <= 25) return str
  return `${str.substring(0, 11)}...${str.substring(str.length - 11)}`
}

export const Message = ({ comment }: { comment: ChatMsg }) => {
  return (
    <>
      <VStack w='full' gap='10px' align='start'>
        <HStack w='full' justifyContent='space-between'>
          <HStack>
            <Avatar
              account={trimAcc(
                comment.sender?.displayName ?? comment.sender.username ?? comment.sender?.account
              )}
              avatarUrl={comment.sender?.pfpUrl}
            />
            <Text {...captionRegular}>
              {trimAcc(
                comment.sender?.displayName ?? comment.sender.username ?? comment.sender?.account
              )}
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
          <Text
            {...paragraphRegular}
            wordBreak='break-word'
            whiteSpace='pre-wrap'
            overflowWrap='break-word'
          >
            {comment.content}
          </Text>
        </VStack>
      </VStack>
      {/* <Divider /> */}
    </>
  )
}
