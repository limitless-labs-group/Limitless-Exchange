import { PropsWithChildren, createContext, useCallback, useContext } from 'react'
import { useWeb3Auth } from '@/providers'
import { useEffect, useState } from 'react'
import { useConnect, useDisconnect } from 'wagmi'
import { Address } from '@/types'
import { defaultChain } from '@/constants'
import { useAmplitude, useEtherspot } from '@/services'
import { UserInfo } from '@web3auth/base'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
  userInfo: Partial<UserInfo> | undefined
  farcasterInfo: FarcasterUserData | undefined
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  /**
   * WEB3AUTH
   */
  const { provider, web3Auth, isConnected } = useWeb3Auth()
  const isLoggedIn = isConnected && !!provider

  /**
   * ADDRESSES
   */
  const { smartWalletAddress: account } = useEtherspot()

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | undefined>()

  useEffect(() => {
    if (isLoggedIn) {
      web3Auth.getUserInfo().then((userInfo) => {
        setUserInfo(userInfo)
        trackSignUp()
        console.log('w3a userInfo:', userInfo)
      })
    }
  }, [isLoggedIn])

  /**
   * FARCASTER
   */
  const { data: farcasterInfo } = useQuery({
    queryKey: ['farcaster', userInfo],
    queryFn: async () => {
      const { data } = await axios.get<FarcasterUsersRequestResponse>(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${userInfo?.verifierId}`,
        {
          headers: {
            api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
          },
        }
      )
      const [farcasterUserData] = data.users
      console.log('farcasterUserData', farcasterUserData)
      return farcasterUserData
    },
    enabled: userInfo?.typeOfLogin === 'farcaster',
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

  /**
   * SIGN IN
   */
  const { connectAsync, connectors } = useConnect()
  const signIn = useCallback(
    () =>
      connectAsync({
        chainId: defaultChain.id,
        connector: connectors.find((c) => c.id === 'web3auth')!,
      }),
    []
  )

  /**
   * SIGN OUT
   */
  const { disconnectAsync } = useDisconnect()
  const signOut = useCallback(async () => disconnectAsync(), [])

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
