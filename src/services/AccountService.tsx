import { PropsWithChildren, createContext, useCallback, useContext } from 'react'
import { useEffect, useState } from 'react'
import { useDisconnect } from 'wagmi'
import { Address } from '@/types'
import { useAmplitude, useEtherspot } from '@/services'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { QueryKeys } from '@/constants/query-keys'
import { usePrivy, User } from '@privy-io/react-auth'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
  userInfo: Partial<User> | undefined
  farcasterInfo: FarcasterUserData | undefined
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  /**
   * WEB3AUTH
   */
  const { ready, authenticated, user } = usePrivy()

  const isLoggedIn = authenticated && ready

  /**
   * ADDRESSES
   */
  const { smartWalletAddress: account } = useEtherspot()

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<User> | undefined>()

  useEffect(() => {
    if (user) {
      setUserInfo(user)
      trackSignUp()
    }
  }, [isLoggedIn])

  /**
   * FARCASTER
   */
  const { data: farcasterInfo } = useQuery({
    queryKey: [QueryKeys.Farcaster, userInfo],
    queryFn: async () => {
      const { data } = await axios.get<FarcasterUsersRequestResponse>(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${userInfo?.id}`,
        {
          headers: {
            api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
          },
        }
      )
      const [farcasterUserData] = data.users
      console.log(farcasterUserData)
      return farcasterUserData
    },
    // Todo check farcaster data
    enabled: !!userInfo?.farcaster,
  })

  /**
   * ANALYTICS
   */
  const { trackSignUp } = useAmplitude()

  const contextProviderValue: IAccountContext = {
    isLoggedIn,
    account,
    userInfo,
    farcasterInfo,
  }

  return <AccountContext.Provider value={contextProviderValue}>{children}</AccountContext.Provider>
}

export const useAuth = () => {
  /**
   * STATE
   */
  const { isLoggedIn } = useAccount()
  const { login, logout } = usePrivy()

  /**
   * SIGN IN
   */
  const signIn = () => login()

  /**
   * SIGN OUT
   */
  const { disconnectAsync } = useDisconnect()
  const signOut = useCallback(async () => {
    await logout()
    await disconnectAsync()
  }, [])

  return {
    isLoggedIn,
    signIn,
    signOut,
  }
}

type FarcasterUserData = {
  fid: number
  username: string
  follower_count: number
}

type FarcasterUsersRequestResponse = {
  users: FarcasterUserData[]
}
