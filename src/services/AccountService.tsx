import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserInfo } from '@web3auth/base'
import { useRouter } from 'next/navigation'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react'
import { getAddress } from 'viem'
import { useDisconnect } from 'wagmi'
import { useAccount as useWagmiAccount } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import { useToast } from '@/hooks'
import { useLogin } from '@/hooks/profiles/use-login'
import { useUserSession } from '@/hooks/profiles/use-session'
import { useWeb3Auth } from '@/providers'
import { useAmplitude, useEtherspot } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { Address, APIError, UpdateProfileData } from '@/types'
import { Profile } from '@/types/profiles'

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
  profileData?: Profile | null
  updateProfileMutation: UseMutationResult<
    Profile | undefined,
    APIError,
    UpdateProfileData,
    unknown
  >
  onBlockUser: UseMutationResult<void, Error, { account: Address }>
  onUnblockUser: UseMutationResult<void, Error, { account: Address }>
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient()
  const { disconnect, isPending: disconnectPending } = useDisconnect()
  const { client } = useWeb3Service()
  const privateClient = useAxiosPrivateClient()
  /**
   * WEB3AUTH
   */
  const { provider, web3Auth, isConnected } = useWeb3Auth()
  const isLoggedIn = isConnected && !!provider

  const { etherspot, smartWalletExternallyOwnedAccountAddress, smartWalletAddress } = useEtherspot()
  const { address, isConnected: isAccountConnected } = useWagmiAccount()
  const toast = useToast()
  const router = useRouter()
  const previousAddressRef = useRef<Address>()
  const isInitialLoad = useRef(true)

  /**
   * ADDRESSES
   */
  // Todo refactor
  const account = useMemo(() => {
    if (web3Auth.status === 'not_ready') {
      return
    }

    if (smartWalletAddress && smartWalletExternallyOwnedAccountAddress) {
      return smartWalletAddress
    }

    if (web3Auth.connectedAdapterName) {
      if (web3Auth.connectedAdapterName === 'openlogin' && !smartWalletAddress) {
        return
      }
    }
    return address
  }, [address, smartWalletAddress, web3Auth.connectedAdapterName, web3Auth.status, isConnected])

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | undefined>()

  const getUserAddress = (account?: `0x${string}`) => {
    const wallet = client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress
    return getAddress(wallet as string)
  }

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profiles', { account }],
    queryFn: async (): Promise<Profile | null> => {
      const res = await privateClient.get(`/profiles/${getUserAddress(account)}`)
      return res.data
    },
    enabled: !!account,
  })

  const { mutateAsync: login } = useLogin()

  const onBlockUser = useMutation({
    mutationKey: ['block-user', account],
    mutationFn: async (data: { account: Address }) => {
      await privateClient.put(`/profiles/${data.account}/block`)
      await queryClient.invalidateQueries({
        queryKey: ['feed'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['market-comments'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['market-page-feed'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['market-feed'],
      })
    },
  })

  const onUnblockUser = useMutation({
    mutationKey: ['unblock-user', account],
    mutationFn: async (data: { account: Address }) => {
      await privateClient.put(`/profiles/${data.account}/unblock`)
      await queryClient.invalidateQueries({
        queryKey: ['market-comments'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['market-page-feed'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['market-feed'],
      })
    },
  })

  const onCreateProfile = async () => {
    await login({ client, account })
  }

  const updateProfileMutation = useMutation<
    Profile | undefined,
    APIError,
    UpdateProfileData,
    unknown
  >({
    mutationKey: ['update-profile'],
    mutationFn: async (data: UpdateProfileData) => {
      const { pfpFile, isDirty, bio, displayName, username } = data
      if (pfpFile) {
        try {
          const formData = new FormData()
          formData.set('pfpFile', pfpFile)
          const response = await privateClient.put('/profiles/pfp', formData, {})
          if (!isDirty) {
            return response.data
          }
        } catch (e) {
          toast({
            render: () => <Toast title={`Image size should be less than 1Mb.`} id={1} />,
          })
        }
      }
      if (isDirty) {
        try {
          const response = await privateClient.put(
            '/profiles',
            {
              ...(profileData?.displayName === displayName ? {} : { displayName }),
              ...(profileData?.username === username ? {} : { username }),
              ...(profileData?.bio === bio ? {} : { bio }),
            },
            {
              headers: {
                'content-type': 'application/json',
              },
            }
          )
          return response.data
        } catch (e) {
          const id = toast({
            render: () => (
              //@ts-ignore
              <Toast id={id} title={e?.response?.data?.message || 'Failed to update profile'} />
            ),
          })
        }
      }
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['profiles', { account }], updatedData)
    },
  })

  useEffect(() => {
    if (isLoggedIn) {
      web3Auth.getUserInfo().then((userInfo) => {
        setUserInfo(userInfo)
      })
    }
  }, [isLoggedIn])

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

  const { mutateAsync: logout } = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await privateClient.post('/auth/logout')
    },
  })

  const { refetch: refetchSession } = useUserSession({ client, account })

  const signout = async () => {
    try {
      await logout()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['positions'] }),
        queryClient.invalidateQueries({ queryKey: ['history'] }),
        queryClient.invalidateQueries({ queryKey: ['profiles'] }),
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
        queryClient.invalidateQueries({ queryKey: ['ethBalance'] }),
        queryClient.invalidateQueries({ queryKey: ['createdMarkets'] }),
        queryClient.invalidateQueries({
          queryKey: ['user-orders'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['locked-balance'],
        }),
      ])
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const displayName = useMemo(() => {
    if (profileData?.displayName) {
      return profileData.displayName
    }
    if (userInfo?.name) {
      return userInfo.name
    }
    return account
  }, [profileData, userInfo, account])

  useEffect(() => {
    if (!profileLoading) {
      if (profileData === null && isLoggedIn) {
        onCreateProfile()
        return
      }
      refetchSession()
    }
  }, [profileLoading, profileData])

  useEffect(() => {
    if (isAccountConnected && !isInitialLoad.current) {
      if (previousAddressRef.current && previousAddressRef.current !== address) {
        signout().catch(console.error)
      }
    }

    previousAddressRef.current = address

    isInitialLoad.current = false
  }, [address, isAccountConnected, logout, signout])

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

  console.log(web3Auth)

  const disconnectFromPlatform = useCallback(async () => {
    disconnect()
    await logout()
    await web3Auth.logout()
    web3Auth.clearCache()
    await etherspot?.destroy()
    queryClient.removeQueries({
      queryKey: ['profiles'],
    })
    queryClient.removeQueries({
      queryKey: ['smartWalletAddress'],
    })
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
    profileData,
    updateProfileMutation,
    onBlockUser,
    onUnblockUser,
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
