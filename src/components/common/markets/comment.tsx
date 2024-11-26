import { HStack, Text, VStack } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { useAccount } from 'wagmi'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { CommentType } from '@/types'
import Avatar from '../avatar'
import { UserContextMenu } from '../user-context-menu'

export type CommentProps = {
  comment: CommentType
  isReply?: boolean
}

export default function Comment({ comment, isReply }: CommentProps) {
  const time = useTimeAgo(comment.createdAt)
  const name = comment.author.displayName ?? comment.author?.username
  const { isConnected } = useAccount()

  //commented stuff will be needed in future

  return (
    <VStack w='full' gap='12px' align='start'>
      <HStack w='full' justifyContent='space-between'>
        <HStack>
          <Avatar
            account={(comment.author?.account as string) ?? ''}
            avatarUrl={comment.author?.pfpUrl}
          />
          <Text {...captionRegular}>{isMobile ? name.slice(0, 20) + '...' : name}</Text>
          <Text {...captionRegular} color='grey.500'>
            {time}
          </Text>
        </HStack>
        {isConnected && (
          <UserContextMenu
            username={comment.author?.displayName}
            userAccount={comment.author?.account}
          />
        )}
      </HStack>
      <VStack gap='8px' align='start'>
        <Text {...paragraphRegular}>{comment.content}</Text>
        {/* {comment.contracts.yes || comment.contracts.no ? ( */}
        {/*   <HStack {...captionRegular} w='full' color='grey.500' gap='4px'> */}
        {/*     <PortfolioIcon width={16} height={16} /> */}
        {/*     <Text> */}
        {/*       {comment.contracts.yes */}
        {/*         ? `Yes - ${comment.contracts.yes} Contract${comment.contracts.yes > 1 ? 's' : ''}` */}
        {/*         : ''} */}
        {/*       {comment.contracts.yes && comment.contracts.no ? ', ' : ''} */}
        {/*       {comment.contracts.no */}
        {/*         ? `No - ${comment.contracts.no} Contract${comment.contracts.no > 1 ? 's' : ''}` */}
        {/*         : ''} */}
        {/*     </Text> */}
        {/*   </HStack> */}
        {/* ) : null} */}
      </VStack>
      {/* <HStack {...captionMedium} w='full' gap='16px' color='grey.500'> */}
      {/*   <HStack gap='4px' cursor='pointer'> */}
      {/*     <ReplyIcon /> */}
      {/*     <Text>Reply</Text> */}
      {/*   </HStack> */}
      {/*   <HStack gap='4px' cursor='pointer'> */}
      {/*     <ShareIcon width={16} height={16} /> */}
      {/*     <Text>Share</Text> */}
      {/*   </HStack> */}
      {/* </HStack> */}

      {/* {comment.replies.length > 0 && ( */}
      {/*   <VStack w='full' pl='6' mt='4' gap='20px'> */}
      {/*     {comment.replies.map((reply: CommentType) => ( */}
      {/*       <Comment key={reply.id} comment={reply} isReply /> */}
      {/*     ))} */}
      {/*   </VStack> */}
      {/* )} */}
    </VStack>
  )
}
