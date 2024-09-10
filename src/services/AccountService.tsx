import { PropsWithChildren, createContext, useContext, useCallback, useMemo } from 'react'
import { useWeb3Auth } from '@/providers'
import { useEffect, useState } from 'react'
import { Address } from '@/types'
import { limitlessApi, useAmplitude, useEtherspot } from '@/services'
import { UserInfo } from '@web3auth/base'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Profile } from '@/types/profiles'
import { getAddress } from 'viem'
import { useWeb3Service } from '@/services/Web3Service'
import { useDisconnect } from 'wagmi'
import { useAccount as useWagmiAccount } from 'wagmi'
import { useUpdatePfp } from '@/hooks/profiles'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
  userInfo: Partial<UserInfo> | undefined
  // farcasterInfo: FarcasterUserData | undefined
  disconnectAccount: () => void
  disconnectFromPlatform: () => void
  disconnectLoading: boolean
  displayName?: string
  displayUsername: string
  bio: string
  profileLoading: boolean
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient()
  const { client } = useWeb3Service()
  const { disconnect, isSuccess: disconnectSuccess, isPending: disconnectPending } = useDisconnect()
  /**
   * WEB3AUTH
   */
  const { provider, web3Auth, isConnected } = useWeb3Auth()
  const isLoggedIn = isConnected && !!provider

  const { smartWalletExternallyOwnedAccountAddress, smartWalletAddress } = useEtherspot()
  const { address } = useWagmiAccount()

  console.log(smartWalletAddress)
  console.log(web3Auth.connectedAdapterName)

  /**
   * ADDRESSES
   */
  // Todo refactor
  const walletAddress = useMemo(() => {
    if (web3Auth.status === 'not_ready') {
      return
    }

    if (smartWalletAddress) {
      return smartWalletAddress
    }

    if (web3Auth.connectedAdapterName) {
      if (web3Auth.connectedAdapterName === 'openlogin' && !smartWalletAddress) {
        return
      }
    }
    return address
  }, [address, smartWalletAddress, web3Auth.connectedAdapterName, web3Auth.status])

  const account =
    web3Auth.connectedAdapterName === 'openLogin'
      ? smartWalletExternallyOwnedAccountAddress
      : walletAddress

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | undefined>()

  useEffect(() => {
    if (isLoggedIn) {
      web3Auth.getUserInfo().then((userInfo) => {
        setUserInfo(userInfo)
      })
    }
  }, [isLoggedIn])

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profiles', { account }],
    queryFn: async (): Promise<Profile | null> => {
      const res = await limitlessApi.get(`/profiles/${getAddress(account!)}`)
      return res.data
    },
    enabled: !!account,
  })

  /**
   * FARCASTER
   */
  // const { data: farcasterInfo } = useQuery({
  //   queryKey: ['farcaster', userInfo],
  //   queryFn: async () => {
  //     const { data } = await axios.get<FarcasterUsersRequestResponse>(
  //       `https://api.neynar.com/v2/farcaster/user/bulk?fids=${userInfo?.verifierId}`,
  //       {
  //         headers: {
  //           api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
  //         },
  //       }
  //     )
  //     const [farcasterUserData] = data.users
  //     return farcasterUserData
  //   },
  //   enabled: userInfo?.typeOfLogin === 'farcaster',
  // })

  console.log(userInfo)

  const displayName = useMemo(() => {
    if (profileData?.displayName) {
      return profileData.displayName
    }
    if (userInfo?.name) {
      return userInfo.name
    }
    return walletAddress
  }, [profileData, userInfo, walletAddress])

  const displayUsername = useMemo(() => {
    if (profileData?.username) {
      return profileData.username
    }
    // Todo add farcaster username
    // if(userInfo.)
    return ''
  }, [profileData?.username])

  const bio = useMemo(() => {
    if (profileData?.bio) {
      return profileData.bio
    }
    return ''
  }, [profileData?.bio])

  const disconnectAccount = () => {
    queryClient.removeQueries({
      queryKey: ['farcaster'],
    })
    setUserInfo(undefined)
  }

  const disconnectFromPlatform = useCallback(() => {
    disconnect()
    disconnectAccount()
  }, [])

  const disconnectLoading = useMemo<boolean>(() => {
    return !!account && disconnectPending
  }, [disconnectPending, account])

  /**
   * ANALYTICS
   */
  const { trackSignUp } = useAmplitude()

  const contextProviderValue: IAccountContext = {
    isLoggedIn,
    account,
    userInfo,
    displayName,
    displayUsername,
    bio,
    disconnectFromPlatform,
    disconnectLoading,
    disconnectAccount,
    profileLoading,
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
