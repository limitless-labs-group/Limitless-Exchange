import { PropsWithChildren, createContext, useContext } from 'react'
import { useWeb3Auth } from '@/providers'
import { useEffect, useState } from 'react'
import { Address } from '@/types'
import { useAmplitude } from '@/services'
import { UserInfo } from '@web3auth/base'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useWalletAddress } from '@/hooks/use-wallet-address'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
  userInfo: Partial<UserInfo> | undefined
  farcasterInfo: FarcasterUserData | undefined
  disconnectAccount: () => void
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient()
  /**
   * WEB3AUTH
   */
  const { provider, web3Auth, isConnected } = useWeb3Auth()
  const isLoggedIn = isConnected && !!provider

  /**
   * ADDRESSES
   */
  const walletAddress = useWalletAddress()

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | undefined>()

  useEffect(() => {
    if (isLoggedIn) {
      web3Auth.getUserInfo().then((userInfo) => {
        setUserInfo(userInfo)
        trackSignUp()
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
      return farcasterUserData
    },
    enabled: userInfo?.typeOfLogin === 'farcaster',
  })

  const disconnectAccount = () => {
    queryClient.removeQueries({
      queryKey: ['farcaster'],
    })
    setUserInfo(undefined)
  }

  /**
   * ANALYTICS
   */
  const { trackSignUp } = useAmplitude()

  const contextProviderValue: IAccountContext = {
    isLoggedIn,
    account: walletAddress,
    userInfo,
    farcasterInfo,
    disconnectAccount,
  }

  return <AccountContext.Provider value={contextProviderValue}>{children}</AccountContext.Provider>
}

type FarcasterUserData = {
  fid: number
  username: string
  follower_count: number
}

type FarcasterUsersRequestResponse = {
  users: FarcasterUserData[]
}
