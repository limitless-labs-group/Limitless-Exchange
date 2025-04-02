import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAccount } from './AccountService'

const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL ?? ''
const SOCKET_GROUP = '/chat'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { account } = useAccount()

  useEffect(() => {
    const socketInstance = io(SOCKET_URL + SOCKET_GROUP, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection Error:', error)
    })

    socketInstance.on('disconnect', (reason) => {
      console.warn('⚠️ Disconnected:', reason)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [account])

  return socket
}
