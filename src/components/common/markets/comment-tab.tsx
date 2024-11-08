import { VStack } from '@chakra-ui/react'
import CommentTextarea from './comment-textarea'
import Comments from './comments'
import { useAccount } from '@/services/AccountService'

export default function CommentTab() {
  const { account } = useAccount()
  return (
    <VStack w='full'>
      {!!account ? <CommentTextarea /> : null}
      <Comments />
    </VStack>
  )
}
