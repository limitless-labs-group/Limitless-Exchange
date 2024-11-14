import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ReplyIcon from '@/resources/icons/reply-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import Dots from '@/resources/icons/three-horizontal-dots.svg'
import { useAccount, useCommentService } from '@/services'
import { captionMedium, captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { CommentType } from '@/types'
import Avatar from '../avatar'

export type CommentProps = {
  comment: CommentType
  isReply?: boolean
}

export default function Comment({ comment, isReply }: CommentProps) {
  const { profileData } = useAccount()
  const account = useWalletAddress()
  const time = useTimeAgo(comment.createdAt)
  const name = comment.author?.username ?? comment.author.displayName

  //commented stuff will be needed in future

  return (
    <VStack w='full' gap='12px' align='start'>
      <HStack w='full' justifyContent='space-between'>
        <HStack>
          <Avatar account={account as string} avatarUrl={profileData?.pfpUrl} />
          <Text {...captionRegular}>{isMobile ? name.slice(0, 20) + '...' : name}</Text>
          <Text {...captionRegular} color='grey.500'>
            {time}
          </Text>
        </HStack>
        <Box cursor='pointer'>{/* <Dots /> */}</Box>
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