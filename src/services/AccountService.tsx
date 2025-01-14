import { usePrivy } from '@privy-io/react-auth'
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserInfo } from '@web3auth/base'
import Cookies from 'js-cookie'
import { usePathname, useRouter } from 'next/navigation'
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V06,
  SmartAccountClient,
  walletClientToSmartAccountSigner,
} from 'permissionless'
import { signerToSafeSmartAccount } from 'permissionless/accounts'
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from 'permissionless/clients/pimlico'
import { ENTRYPOINT_ADDRESS_V06_TYPE } from 'permissionless/types'
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
import { http, useDisconnect, useWalletClient } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import { defaultChain } from '@/constants'
import { useToast } from '@/hooks'
import { useLogin } from '@/hooks/profiles/use-login'
import { useUserSession } from '@/hooks/profiles/use-session'
import useClient from '@/hooks/use-client'
import { publicClient } from '@/providers/Privy'
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
  smartAccountClient: SmartAccountClient<ENTRYPOINT_ADDRESS_V06_TYPE> | null
}

const pimlicoRpcUrl = `https://api.pimlico.io/v2/84532/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

const pimlicoPaymaster = createPimlicoPaymasterClient({
  transport: http(pimlicoRpcUrl),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
})

export const bundlerClient = createPimlicoBundlerClient({
  transport: http(pimlicoRpcUrl),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
})

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  const [smartAccountClient, setSmartAccountClient] =
    useState<SmartAccountClient<ENTRYPOINT_ADDRESS_V06_TYPE> | null>(null)
  const queryClient = useQueryClient()
  const { logout: disconnect, authenticated, user, isModalOpen } = usePrivy()
  const pathname = usePathname()
  const accountRoutes = ['/portfolio', '/create-market']
  const privateClient = useAxiosPrivateClient()
  const { mutateAsync: login } = useLogin()
  const { disconnect: disconnectWagmi } = useDisconnect()
  const web3Client = user?.wallet?.connectorType === 'injected' ? 'eoa' : 'etherspot'
  const { trackSignUp } = useAmplitude()
  const { data: walletClient } = useWalletClient()
  const { isLogged } = useClient()

  const toast = useToast()
  const router = useRouter()

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
    if (isLogged || authenticated) {
      if (web3Client === 'etherspot' && !smartAccountClient) {
        return true
      }
      return profileData === undefined || profileLoading
    }
    return false
  }, [profileData, profileLoading, web3Client, smartAccountClient, authenticated])

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
      if (web3Client === 'etherspot' && !smartAccountClient) {
        return
      }
      await login({
        client: web3Client,
        account: user.wallet.address as Address,
        smartWallet: smartAccountClient?.account?.address,
      })
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
    smartWallet: smartAccountClient?.account?.address,
  })

  const displayName = useMemo(() => {
    if (profileData?.displayName) {
      return profileData.displayName
    }
    if (userInfo?.name) {
      return userInfo.name
    }
    if (web3Client === 'etherspot' && smartAccountClient?.account?.address) {
      return smartAccountClient.account.address
    }
    return user?.wallet?.address as Address | undefined
  }, [profileData, userInfo, web3Client, user?.wallet?.address, smartAccountClient])

  const account = useMemo(() => {
    if (web3Client === 'etherspot') {
      if (smartAccountClient) {
        return smartAccountClient.account?.address
      }
    }
    return user?.wallet?.address as Address | undefined
  }, [smartAccountClient, user, web3Client])

  useEffect(() => {
    if (web3Client === 'etherspot' && !smartAccountClient) {
      return
    }
    if (!profileLoading && user?.wallet?.address) {
      if (profileData === null && authenticated) {
        onCreateProfile()
        return
      }
      // refetchSession()
    }
    if (!profileLoading && user?.wallet?.address) {
      const isLogged = Cookies.get('logged-in-to-limitless')
      if (!isLogged) {
        login({
          client: web3Client,
          account: user.wallet.address as Address,
          smartWallet: smartAccountClient?.account?.address,
        })
      }
    }
  }, [profileLoading, profileData, user, web3Client, smartAccountClient, authenticated])

  useEffect(() => {
    ;(async () => {
      if (
        authenticated &&
        walletClient &&
        publicClient &&
        web3Client === 'etherspot' &&
        !smartAccountClient
      ) {
        const customSigner = walletClientToSmartAccountSigner(walletClient)

        const safeSmartAccountClient = await signerToSafeSmartAccount(publicClient, {
          entryPoint: ENTRYPOINT_ADDRESS_V06,
          signer: customSigner,
          safeVersion: '1.4.1',
          saltNonce: BigInt(0),
        })

        const smartAccountClient = createSmartAccountClient({
          account: safeSmartAccountClient,
          entryPoint: ENTRYPOINT_ADDRESS_V06,
          chain: defaultChain,
          bundlerTransport: http(pimlicoRpcUrl, {
            timeout: 30_000,
          }),
          middleware: {
            gasPrice: async () => (await bundlerClient.getUserOperationGasPrice()).fast,
            sponsorUserOperation: pimlicoPaymaster.sponsorUserOperation,
          },
        })

        // @ts-ignore
        setSmartAccountClient(smartAccountClient)
      }
    })()
  }, [authenticated, walletClient, publicClient, web3Client, smartAccountClient])

  // useEffect(() => {
  //   if (isAccountConnected && !isInitialLoad.current) {
  //     if (previousAddressRef.current && previousAddressRef.current !== address) {
  //       signout().catch(console.error)
  //     }
  //   }
  //
  //   previousAddressRef.current = address
  //
  //   isInitialLoad.current = false
  // }, [address, isAccountConnected, logout, signout])

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
    if (accountRoutes.includes(pathname)) {
      router.push('/')
    }
    await logout()
    await disconnect()
    disconnectWagmi()
    queryClient.removeQueries({
      queryKey: ['profiles'],
    })
    setSmartAccountClient(null)
    Cookies.remove('logged-in-to-limitless')
  }, [])

  const contextProviderValue: IAccountContext = {
    isLoggedIn: authenticated,
    account,
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
    smartAccountClient,
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
