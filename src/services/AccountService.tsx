import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserInfo } from '@web3auth/base'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { getAddress, toHex } from 'viem'
import { useDisconnect, useSignMessage } from 'wagmi'
import { useAccount as useWagmiAccount } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useCreateProfile } from '@/hooks/profiles'
import { useWeb3Auth } from '@/providers'
import { limitlessApi, useAmplitude, useEtherspot, useLimitlessApi } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { Address, APIError, UpdateProfileData } from '@/types'
import { Profile, ProfileActionType } from '@/types/profiles'

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
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient()
  const { disconnect, isPending: disconnectPending } = useDisconnect()
  const { client } = useWeb3Service()
  /**
   * WEB3AUTH
   */
  const { provider, web3Auth, isConnected } = useWeb3Auth()
  const isLoggedIn = isConnected && !!provider

  const { signMessageAsync } = useSignMessage()
  const { smartWalletExternallyOwnedAccountAddress, smartWalletAddress, signMessage } =
    useEtherspot()
  const { address } = useWagmiAccount()
  const { getSigningMessage } = useLimitlessApi()
  const toast = useToast()

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
  }, [address, smartWalletAddress, web3Auth.connectedAdapterName, web3Auth.status])

  /**
   * USER INFO / METADATA
   */
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | undefined>()

  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profiles', { account }],
    queryFn: async (): Promise<Profile | null> => {
      const wallet = client === 'eoa' ? account : smartWalletExternallyOwnedAccountAddress
      const res = await limitlessApi.get(`/profiles/${getAddress(wallet as string)}`)
      return res.data
    },
    enabled: !!account,
  })

  const { mutateAsync: createProfile } = useCreateProfile()

  const onCreateProfile = async () => {
    await createProfile({
      displayName: displayName ? displayName : '',
      username: account ? account : '',
      bio: '',
      account,
      client,
    })
    await refetchProfile()
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
      const { data: updateProfileMessage } = await getSigningMessage(
        ProfileActionType.UPDATE_PROFILE
      )
      const signature =
        client === 'eoa'
          ? await signMessageAsync({ message: updateProfileMessage, account })
          : await signMessage(updateProfileMessage)
      const headers = {
        'content-type': 'multipart/form-data',
        'x-account':
          client === 'eoa'
            ? getAddress(account as string)
            : getAddress(smartWalletExternallyOwnedAccountAddress as string),
        'x-signature': signature,
        'x-signing-message': toHex(String(updateProfileMessage)),
      }
      if (pfpFile) {
        try {
          const formData = new FormData()
          formData.set('pfpFile', pfpFile)
          const response = await limitlessApi.put('/profiles/pfp', formData, {
            headers,
          })
          await queryClient.refetchQueries({
            queryKey: ['profiles', { account }],
          })
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
          const response = await limitlessApi.put(
            '/profiles',
            {
              ...(profileData?.displayName === displayName ? {} : { displayName }),
              ...(profileData?.username === username ? {} : { username }),
              ...(profileData?.bio === bio ? {} : { bio }),
            },
            {
              headers: {
                ...headers,
                'content-type': 'application/json',
              },
            }
          )
          await queryClient.refetchQueries({
            queryKey: ['profiles', { account }],
          })
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
    if (!profileLoading && profileData === null) {
      onCreateProfile()
    }
  }, [profileLoading, profileData])

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

  const disconnectFromPlatform = useCallback(async () => {
    disconnect()
    await web3Auth.logout()
    queryClient.removeQueries({
      queryKey: ['profiles'],
    })
    queryClient.removeQueries({
      queryKey: ['smartWalletAddress'],
    })
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
    profileData,
    updateProfileMutation,
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
