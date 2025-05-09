import { Box, Text, VStack, Flex } from '@chakra-ui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ChatTextarea } from './chat-area'
import { Message } from './message'
import CommentIcon from '@/resources/icons/opinion-icon.svg'
import { useSocket } from '@/services/SocketService'
import { paragraphRegular, headline } from '@/styles/fonts/fonts.styles'
import { Profile } from '@/types/profiles'
import Paper from '../common/paper'

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

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (firstMessageRef.current && chatContainerRef.current) {
      const prevHeight = firstMessageRef.current.offsetHeight
      chatContainerRef.current.scrollTop += prevHeight
    }
  }, [messages])

  useEffect(() => {
    if (!socket) return
    socket.emit('getMessages', { limit: 1000 })
  }, [socket])

  useEffect(() => {
    if (!socket) return
    socket.on('recentMessages', (msg: ChatMsg[]) => {
      setMessages(msg)
    })

    socket.on('error', (error) => {
      console.log('❌ Socket Error: ', error)
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
      socket.off('error')
    }
  }, [socket])

  const sendMessage = () => {
    if (!socket) return
    if (newMessage.trim()) {
      socket.emit('sendMessage', { content: newMessage })
      setNewMessage('')
    }
  }

  return (
    <Box w='full' h='full' p={3} position='relative'>
      {messages && messages.length > 0 ? (
        <Box
          ref={chatContainerRef}
          h='full'
          overflowY='auto'
          display='flex'
          flexDirection='column-reverse'
          pb={isMobile ? '30px' : '150px'}
        >
          <Flex w='full' mt='24px' mb={isMobile ? '55px' : 'unset'}>
            <VStack w='full' gap='20px'>
              {messages.map((msg: ChatMsg) => (
                <Fragment key={msg.id}>
                  <Message comment={msg} />
                </Fragment>
              ))}
            </VStack>
          </Flex>
        </Box>
      ) : (
        <Box h='full' pb='150px' display='flex' alignItems='center' justifyContent='center'>
          <VStack w='full' mt={isMobile ? '50px' : '24px'} mb={isMobile ? '120px' : '24px'}>
            <Paper p='16px'>
              <CommentIcon width={24} height={24} />
            </Paper>
            <Text {...headline} mt='4px'>
              No messages yet
            </Text>
            <Text {...paragraphRegular}>Be the first to share your opinion!</Text>
          </VStack>
        </Box>
      )}

      <Box
        position='absolute'
        bottom={isMobile ? '20px' : '0'}
        left='0'
        right='0'
        p={3}
        bg='grey.50'
        zIndex={1}
      >
        <ChatTextarea onSubmit={sendMessage} msg={newMessage} setMsg={setNewMessage} />
      </Box>
    </Box>
  )
}
