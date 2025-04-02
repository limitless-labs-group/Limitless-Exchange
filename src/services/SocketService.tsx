import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAccount } from './AccountService'

const SOCKET_URL = 'https://dev.ws.limitless.exchange/chat'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { account } = useAccount()

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
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
