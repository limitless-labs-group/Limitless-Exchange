import { Box, Text, VStack, Divider, Flex, HStack } from '@chakra-ui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ChatTextarea } from './chat-area'
import { useTimeAgo } from '@/hooks/use-time-ago'
import CommentIcon from '@/resources/icons/opinion-icon.svg'
import { useAccount } from '@/services'
import { useSocket } from '@/services/SocketService'
import { paragraphRegular, headline, captionRegular } from '@/styles/fonts/fonts.styles'
import { Profile } from '@/types/profiles'
import Avatar from '../common/avatar'
import Paper from '../common/paper'
import { UserContextMenu } from '../common/user-context-menu'

export type ChatMsg = {
  content: string
  createdAt: string
  id: number
  sender: Profile
  senderId: number
}

export default function Chat() {
  const socket = useSocket()
  const [messages, setMessages] = useState<ChatMsg[] | undefined>(undefined)
  const [newMessage, setNewMessage] = useState('')
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const firstMessageRef = useRef<HTMLDivElement | null>(null)
  const { isLoggedIn } = useAccount()

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (firstMessageRef.current && chatContainerRef.current) {
      const prevHeight = firstMessageRef.current.offsetHeight
      chatContainerRef.current.scrollTop += prevHeight
    }
  }, [messages])

  useEffect(() => {
    if (!socket) return
    socket.emit('getMessages')
  }, [socket])

  useEffect(() => {
    if (!socket) return
    socket.on('recentMessages', (msg: ChatMsg[]) => {
      setMessages(msg)
    })

    socket.on('newMessage', (msg: ChatMsg) => {
      setMessages((prev) => (prev ? [...prev, msg] : [msg]))
      // Auto-scroll only if the user is at the bottom
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          setTimeout(() => {
            chatContainerRef.current?.scrollTo({ top: scrollHeight, behavior: 'smooth' })
          }, 100)
        }
      }
    })

    return () => {
      socket.off('newMessage')
      socket.off('recentMessages')
    }
  }, [socket])

  const sendMessage = () => {
    if (!socket) return
    if (newMessage.trim()) {
      socket.emit('sendMessage', { content: newMessage })
      setNewMessage('')
    }
  }

  const Message = ({ comment }: { comment: ChatMsg }) => {
    return (
      <>
        <VStack w='full' gap='12px' align='start'>
          <HStack w='full' justifyContent='space-between'>
            <HStack>
              <Avatar account={comment.sender?.account ?? ''} avatarUrl={comment.sender?.pfpUrl} />
              <Text {...captionRegular}>{comment.sender?.account ?? ''}</Text>
              <Text {...captionRegular} color='grey.500'>
                {useTimeAgo(comment.createdAt)}
              </Text>
            </HStack>
            {isLoggedIn && (
              <UserContextMenu
                username={comment.sender?.displayName ?? comment.sender?.account}
                userAccount={comment.sender?.account}
                setMessageBlocked={(arg) => console.log(arg)}
              />
            )}
          </HStack>
          <VStack gap='8px' align='start'>
            <Text {...paragraphRegular}>{comment.content}</Text>
          </VStack>
        </VStack>
        <Divider />
      </>
    )
  }

  return messages && messages?.length > 0 ? (
    <Box w='full' h='full' p={3} position='relative'>
      <Box
        ref={chatContainerRef}
        h='full'
        overflowY='auto'
        display='flex'
        flexDirection='column-reverse'
        pb='150px'
      >
        <Flex w='full' mt='24px'>
          <VStack w='full' gap='16px'>
            {messages?.map((msg: ChatMsg) => (
              <Fragment key={msg.id}>
                <Message comment={msg} />
              </Fragment>
            ))}
          </VStack>
        </Flex>
      </Box>
      <Box
        position='absolute'
        bottom='0'
        left='0'
        right='0'
        p={3}
        bg='white'
        borderTop='1px solid'
        borderColor='grey.200'
        zIndex={1}
      >
        <ChatTextarea onSubmit={sendMessage} msg={newMessage} setMsg={setNewMessage} />
      </Box>
    </Box>
  ) : (
    <VStack w='full' mt={isMobile ? '50px' : '24px'} mb={isMobile ? '120px' : '24px'}>
      <Paper p='16px'>
        <CommentIcon width={24} height={24} />
      </Paper>
      <Text {...headline} mt='4px'>
        No messages yet
      </Text>
      <Text {...paragraphRegular}>Be the first to share your opinion!</Text>
    </VStack>
  )
}
