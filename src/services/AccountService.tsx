import { usePrivy } from '@privy-io/react-auth'
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserInfo } from '@web3auth/base'
import Cookies from 'js-cookie'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { getAddress } from 'viem'
import { Toast } from '@/components/common/toast'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import { useToast } from '@/hooks'
import { useLogin } from '@/hooks/profiles/use-login'
import { useUserSession } from '@/hooks/profiles/use-session'
import useClient from '@/hooks/use-client'
import { useAmplitude } from '@/services'
import { Address, APIError, UpdateProfileData } from '@/types'
import { Profile } from '@/types/profiles'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
  userInfo: Partial<UserInfo> | undefined
  // farcasterInfo: FarcasterUserData | undefined
  disconnectFromPlatform: () => void
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
  web3Client: 'eoa' | 'etherspot'
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient()
  const { logout: disconnect, authenticated, user } = usePrivy()
  const privateClient = useAxiosPrivateClient()
  const { mutateAsync: login } = useLogin()
  const { isLogged } = useClient()
  const web3Client = user?.wallet?.connectorType === 'injected' ? 'eoa' : 'etherspot'
  const { trackSignUp } = useAmplitude()

  const toast = useToast()

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | undefined>()

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profiles', { account: user?.wallet?.address }],
    queryFn: async (): Promise<Profile | null> => {
      const res = await privateClient.get(
        `/profiles/${getAddress(user?.wallet?.address as string)}`
      )
      return res.data
    },
    enabled: !!user?.wallet?.address,
  })

  const userMenuLoading = useMemo(() => {
    if (isLogged) {
      return profileData === undefined || profileLoading
    }
    return false
  }, [isLogged, profileData, profileLoading])

  const onBlockUser = useMutation({
    mutationKey: ['block-user', user?.wallet?.address],
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
    mutationKey: ['unblock-user', user?.wallet?.address],
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
    if (user?.wallet?.address) {
      await login({ client: web3Client, account: user.wallet.address as Address })
      trackSignUp()
    }
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
      queryClient.setQueryData(['profiles', { account: user?.wallet?.address }], updatedData)
    },
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

  const { mutateAsync: logout } = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await privateClient.post('/auth/logout')
    },
  })

  const { refetch: refetchSession } = useUserSession({
    client: web3Client,
    account: user?.wallet?.address as Address | undefined,
  })

  const displayName = useMemo(() => {
    if (profileData?.displayName) {
      return profileData.displayName
    }
    if (userInfo?.name) {
      return userInfo.name
    }
    return user?.wallet?.address
  }, [profileData, userInfo, user?.wallet?.address])

  useEffect(() => {
    if (!profileLoading) {
      if (profileData === null && authenticated) {
        onCreateProfile()
        return
      }
      refetchSession()
    }
    if (!profileLoading && user?.wallet?.address) {
      const isLogged = Cookies.get('logged-in-to-limitless')
      if (!isLogged) {
        login({ client: web3Client, account: user.wallet.address as Address })
      }
    }
  }, [profileLoading, profileData, user])

  const displayUsername = useMemo(() => {
    if (profileData?.username) {
      return profileData.username
    }
    // Todo add farcaster username
    return ''
  }, [profileData?.username])

  const bio = useMemo(() => {
    if (profileData?.bio) {
      return profileData.bio
    }
    return ''
  }, [profileData?.bio])

  const disconnectFromPlatform = useCallback(async () => {
    await logout()
    await disconnect()
    queryClient.removeQueries({
      queryKey: ['profiles'],
    })
    Cookies.remove('logged-in-to-limitless')
  }, [])

  const contextProviderValue: IAccountContext = {
    isLoggedIn: authenticated,
    account: user?.wallet?.address as Address | undefined,
    userInfo,
    displayName,
    displayUsername,
    bio,
    disconnectFromPlatform,
    profileLoading: userMenuLoading,
    profileData,
    updateProfileMutation,
    onBlockUser,
    onUnblockUser,
    web3Client,
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
