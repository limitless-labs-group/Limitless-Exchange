import { HStack, Text, VStack, useTheme, useToast } from '@chakra-ui/react'
import { memo, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useAccount } from 'wagmi'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useLikeComment, useUnlikeComment } from '@/services/CommentService'
import { captionMedium, captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { CommentType } from '@/types'
import Avatar from '../avatar'
import { Toast } from '../toast'
import { UserContextMenu } from '../user-context-menu'

export type CommentProps = {
  comment: CommentType
  isReply?: boolean
}

export default function Comment({ comment, isReply }: CommentProps) {
  const time = useTimeAgo(comment.createdAt)
  const name = comment.author.displayName ?? comment.author?.username
  const account = useWalletAddress()
  const { isConnected } = useAccount()
  const [messageBlocked, setMessageBlocked] = useState(false)
  const { mutateAsync: like, isPending: isLikeLoading } = useLikeComment(Number(comment.id))
  const { mutateAsync: unlike, isPending: isUnlikeLoading } = useUnlikeComment(Number(comment.id))
  const toast = useToast()
  const isLikedByAuthor = useMemo(
    () => comment.likes.some((item) => item.user.account === account),
    [comment, account]
  )
  const [isLiked, setIsLiked] = useState(isLikedByAuthor)
  const [likes, setLikes] = useState(comment.likes.length)

  const handleLike = async () => {
    if (!isConnected) {
      const id = toast({
        render: () => <Toast title={'Login to like a post'} id={id} />,
        position: 'top-right',
      })
      return
    }
    try {
      if (isLiked) {
        await unlike()
        setIsLiked(false)
        setLikes(likes - 1)
        return
      }
      await like()
      setIsLiked(true)
      setLikes(likes + 1)
    } catch (error) {
      const id = toast({
        render: () => <Toast title={'Failed to update like'} id={id} />,
        position: 'top-right',
      })
    }
  }

  //commented stuff will be needed in future

  return (
    <VStack w='full' gap='12px' align='start'>
      <HStack w='full' justifyContent='space-between'>
        <HStack opacity={messageBlocked ? 0.5 : 1}>
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
            setMessageBlocked={setMessageBlocked}
          />
        )}
      </HStack>
      <VStack gap='8px' align='start' opacity={messageBlocked ? 0.5 : 1}>
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
      <HStack {...captionMedium} w='full' gap='16px' color='grey.500'>
        <HStack
          as='button'
          gap='4px'
          cursor='pointer'
          aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
          disabled={isLikeLoading || isUnlikeLoading}
          onClick={handleLike}
        >
          <LikeIcon isLiked={isLiked} />
          <Text color={isLiked ? 'red.500' : 'grey.500'}>{likes === 0 ? 'Like' : likes}</Text>
        </HStack>
      </HStack>

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

type LikeIconProps = {
  isLiked: boolean
}

const LikeIcon = memo(({ isLiked }: LikeIconProps) => {
  const theme = useTheme()
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      aria-hidden='true'
      viewBox='0 0 16 16'
      fill={isLiked ? theme.colors.red[500] : 'none'}
      stroke={isLiked ? theme.colors.red[500] : theme.colors.grey[500]}
      strokeWidth='1.33333'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5927 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82668 2 9.00001 2.33333 8.00001 3.33333C7.00001 2.33333 6.17334 2 5.00001 2C4.02755 2 3.09492 2.38631 2.40729 3.07394C1.71965 3.76158 1.33334 4.69421 1.33334 5.66667C1.33334 7.2 2.33334 8.36667 3.33334 9.33333L8.00001 14L12.6667 9.33333Z' />
    </svg>
  )
})

LikeIcon.displayName = 'LikeIcon'
