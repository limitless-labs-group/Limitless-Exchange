import {
  ConnectedWallet,
  usePrivy,
  useWallets,
  useLogin as usePrivyLogin,
  LoginModalOptions,
} from '@privy-io/react-auth'
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V06,
  providerToSmartAccountSigner,
  SmartAccountClient,
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
import { createWalletClient, getAddress, WalletClient, http, custom } from 'viem'
import { Toast } from '@/components/common/toast'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import useGoogleAnalytics, { GAEvents } from './GoogleAnalytics'
import { defaultChain } from '@/constants'
import { useToast } from '@/hooks'
import { useLogin } from '@/hooks/profiles/use-login'
import { useRefetchSession } from '@/hooks/profiles/use-session'
import useClient from '@/hooks/use-client'
import { publicClient } from '@/providers/Privy'
import { Address, APIError, UpdateProfileData } from '@/types'
import { Profile } from '@/types/profiles'
import { LOGGED_IN_TO_LIMITLESS } from '@/utils/consts'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
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
  web3Wallet: WalletClient | null
  loginToPlatform: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
}

const pimlicoRpcUrl = `https://api.pimlico.io/v2/${defaultChain.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

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
  const [web3Wallet, setWeb3Wallet] = useState<WalletClient | null>(null)
  const queryClient = useQueryClient()
  const { logout: disconnect, authenticated, user } = usePrivy()
  const pathname = usePathname()
  const accountRoutes = ['/portfolio', '/create-market']
  const privateClient = useAxiosPrivateClient()
  const { mutateAsync: login } = useLogin()
  const web3Client = user?.wallet?.walletClientType === 'privy' ? 'etherspot' : 'eoa'
  const { wallets, ready: walletsReady } = useWallets()
  const { isLogged } = useClient()
  const { refetchSession } = useRefetchSession()
  const { pushGA4Event } = useGoogleAnalytics()

  const toast = useToast()
  const router = useRouter()

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
  }, [isLogged, authenticated, web3Client, smartAccountClient, profileData, profileLoading])

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

  // const onCreateProfile = async () => {
  //   if (user?.wallet?.address) {
  //     if (web3Client === 'etherspot' && !smartAccountClient) {
  //       return
  //     }
  //     await login({
  //       client: web3Client,
  //       account: user.wallet.address as Address,
  //       smartWallet: smartAccountClient?.account?.address,
  //       web3Wallet,
  //     })
  //     trackSignUp()
  //   }
  // }

  const getSmartAccountClient = async (wallet: ConnectedWallet) => {
    const provider = await wallet.getEthereumProvider()
    //@ts-ignore
    const customSigner = await providerToSmartAccountSigner(provider)

    const safeSmartAccountClient = await signerToSafeSmartAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      signer: customSigner,
      safeVersion: '1.4.1',
      saltNonce: BigInt(0),
    })

    return createSmartAccountClient({
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
  }

  console.log(wallets)

  const { login: loginToPlatform } = usePrivyLogin({
    onComplete: async ({ user, wasAlreadyAuthenticated }) => {
      console.log(wallets)
      const connectedWallet = wallets[0]
      if (connectedWallet && !wasAlreadyAuthenticated) {
        pushGA4Event(`select_wallet_${connectedWallet.walletClientType}`)
        pushGA4Event(GAEvents.SelectAnyWallet)
        const provider = await connectedWallet.getEthereumProvider()
        const walletClient = createWalletClient({
          chain: defaultChain,
          transport: custom(provider),
          account: connectedWallet.address as Address,
        })
        setWeb3Wallet(walletClient)
        if (connectedWallet.connectorType === 'embedded') {
          const client = await getSmartAccountClient(connectedWallet)
          //@ts-ignore
          setSmartAccountClient(client)
          await login({
            client: 'etherspot',
            account: connectedWallet.address as Address,
            smartWallet: client.account?.address,
            web3Wallet: walletClient,
          })
          return
        }
        await login({
          client: 'eoa',
          account: connectedWallet.address as Address,
          web3Wallet: walletClient,
        })

        pushGA4Event(GAEvents.WalletConnected)
        // trackSignIn(SignInEvent.SignIn)
        // setIsLogged(true)
        return
      }
    },
    onError: (error) => {
      console.log(error)
    },
  })

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

  const getWallet = async (): Promise<WalletClient | undefined> => {
    const wallet = wallets[0]
    if (wallet) {
      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({
        chain: defaultChain,
        transport: custom(provider),
        account: wallet.address as Address,
      })
      setWeb3Wallet(walletClient)
      return
    } else {
      await disconnectFromPlatform()
    }
    return
  }

  useEffect(() => {
    if (walletsReady && !web3Wallet) {
      getWallet()
    }
  }, [walletsReady, web3Wallet])

  const { mutateAsync: logout } = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await privateClient.post('/auth/logout')
    },
  })

  useEffect(() => {
    if (isLogged && web3Client) {
      refetchSession({
        client: web3Client,
        account: user?.wallet?.address as Address | undefined,
        smartWallet: smartAccountClient?.account?.address,
        web3Wallet,
      })
    }
  }, [
    smartAccountClient?.account?.address,
    user?.wallet?.address,
    web3Client,
    web3Wallet,
    isLogged,
  ])

  const signout = useCallback(async () => {
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
        queryClient.invalidateQueries({
          queryKey: ['positions'],
        }),
      ])
      queryClient.removeQueries({
        queryKey: ['profiles'],
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  const displayName = useMemo(() => {
    if (profileData?.displayName) {
      return profileData.displayName
    }
    if (web3Client === 'etherspot' && smartAccountClient?.account?.address) {
      return smartAccountClient.account.address
    }
    return user?.wallet?.address as Address | undefined
  }, [profileData, web3Client, user?.wallet?.address, smartAccountClient])

  const account = useMemo(() => {
    if (web3Client === 'etherspot') {
      if (smartAccountClient) {
        return smartAccountClient.account?.address
      }
      return
    }
    return user?.wallet?.address as Address | undefined
  }, [smartAccountClient, user, web3Client])

  const getAndStoreSmartAccountClient = async (wallet: ConnectedWallet) => {
    const smartAccountClient = await getSmartAccountClient(wallet)
    //@ts-ignore
    setSmartAccountClient(smartAccountClient)
  }

  useEffect(() => {
    ;(async () => {
      if (
        authenticated &&
        wallets.length &&
        walletsReady &&
        web3Client === 'etherspot' &&
        !smartAccountClient
      ) {
        const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy')

        if (embeddedWallet) {
          getAndStoreSmartAccountClient(embeddedWallet)
        }
      }
    })()
  }, [authenticated, wallets, publicClient, web3Client, smartAccountClient, walletsReady])

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
    localStorage.removeItem(LOGGED_IN_TO_LIMITLESS)
    setSmartAccountClient(null)
    setWeb3Wallet(null)
    if (accountRoutes.includes(pathname)) {
      router.push('/')
    }
    await disconnect()
    await signout()
  }, [pathname])

  const contextProviderValue: IAccountContext = {
    isLoggedIn: authenticated || !!isLogged,
    account,
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
    web3Wallet,
    loginToPlatform,
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
