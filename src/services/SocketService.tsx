import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAccount } from './AccountService'

const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL ?? ''
const SOCKET_GROUP = '/chat'

let socketInstance: Socket | null = null

const socketAtom = atom<Socket | null>(null)

const initializeSocket = () => {
  if (socketInstance) return socketInstance

  socketInstance = io(SOCKET_URL + SOCKET_GROUP, {
    path: '/socket.io',
    transports: ['websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  })

  socketInstance.on('connect_error', (error) => {
    console.error('❌ Connection Error:', error)
  })

  socketInstance.on('disconnect', (reason) => {
    console.warn('⚠️ Disconnected:', reason)
  })

  return socketInstance
}

export function useSocket() {
  const [socket, setSocket] = useAtom(socketAtom)
  const { account } = useAccount()

  useEffect(() => {
    if (!socket) {
      const instance = initializeSocket()
      setSocket(instance)
    }
  }, [socket, account, setSocket])

  return socket
}
//for manual disconnection
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
