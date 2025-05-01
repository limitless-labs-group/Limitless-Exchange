import {
  ConnectedWallet,
  usePrivy,
  useWallets,
  useLogin as usePrivyLogin,
  LoginModalOptions,
} from '@privy-io/react-auth'
import spindl from '@spindl-xyz/attribution'
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
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
import { SignInEvent, useAmplitude } from './Amplitude'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import useGoogleAnalytics, { GAEvents } from './GoogleAnalytics'
import usePendingTrade from './PendingTradeService'
import { accountAtom } from '@/atoms/account'
import { defaultChain } from '@/constants'
import { useToast } from '@/hooks'
import { useLogin } from '@/hooks/profiles/use-login'
import { useRefetchSession } from '@/hooks/profiles/use-session'
import useClient from '@/hooks/use-client'
import { useUrlParams } from '@/hooks/use-url-param'
import { publicClient } from '@/providers/Privy'
import { Address, APIError, UpdateProfileData } from '@/types'
import { Profile, ReferralData } from '@/types/profiles'
import { LOGGED_IN_TO_LIMITLESS, USER_ID } from '@/utils/consts'

export interface IAccountContext {
  isLoggedIn: boolean
  account: Address | undefined
  disconnectFromPlatform: () => void
  displayName?: string
  displayUsername: string
  bio: string
  referralCode: string
  refLink: string
  profileLoading: boolean
  referralData?: ReferralData
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
  profilePageOpened: boolean
  walletPageOpened: boolean
  setProfilePageOpened: (val: boolean) => void
  setWalletPageOpened: (val: boolean) => void
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
  const [profilePageOpened, setProfilePageOpened] = useState(false)
  const [walletPageOpened, setWalletPageOpened] = useState(false)
  const queryClient = useQueryClient()
  const { logout: disconnect, authenticated, user } = usePrivy()
  const pathname = usePathname()
  const accountRoutes = ['/portfolio', '/create-market']
  const privateClient = useAxiosPrivateClient()
  const { mutateAsync: login } = useLogin()
  const web3Client = user?.wallet?.walletClientType === 'privy' ? 'etherspot' : 'eoa'
  const { wallets } = useWallets()
  const { isLogged } = useClient()
  const { refetchSession } = useRefetchSession()
  const { pushGA4Event } = useGoogleAnalytics()
  const [, setAcc] = useAtom(accountAtom)
  const { handleRedirect } = usePendingTrade()
  const { trackSignIn, trackSignUp } = useAmplitude()
  const isDev = process.env.NODE_ENV === 'development'
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

  const { getParam } = useUrlParams()
  const r = getParam('r')

  useEffect(() => {
    if (user?.wallet?.address) {
      setAcc({ account: user.wallet.address as string })
      if (!isDev) {
        spindl.attribute(user.wallet.address)
      }
    }
  }, [user, isDev])

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

  const { login: loginToPlatform } = usePrivyLogin({
    onComplete: async ({ user, wasAlreadyAuthenticated, isNewUser }) => {
      const referral = { referral: r ?? 'Empty' }
      const connectedWallet = wallets.find(
        (wallet) => wallet.connectorType === user.wallet?.connectorType
      )
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
            r,
          })
          if (!isDev) {
            spindl.attribute(client.account?.address)
          }
          pushGA4Event(GAEvents.WalletConnected)
          if (isNewUser) {
            trackSignUp(SignInEvent.SignedUp, {
              signedIn: true,
              account: client.account?.address ?? '',
              ...referral,
            })
            return
          }
          trackSignIn(SignInEvent.SignedIn, {
            signedIn: true,
            account: client.account?.address ?? '',
            ...referral,
          })
          return
        }
        await login({
          client: 'eoa',
          account: connectedWallet.address as Address,
          web3Wallet: walletClient,
          r,
        })
        if (!isDev) {
          spindl.attribute(connectedWallet.address)
        }
        pushGA4Event(GAEvents.WalletConnected)
        await handleRedirect()
        setAcc({ account: connectedWallet.address ?? '' })
        trackSignIn(SignInEvent.SignedIn, {
          signedIn: true,
          account: connectedWallet.address ?? '',
          ...referral,
        })
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

  const getWallet = async (): Promise<WalletClient | undefined> => {
    const wallet =
      web3Client === 'etherspot'
        ? wallets.find((wallet) => wallet.walletClientType === 'privy')
        : wallets[0]
    if (wallet) {
      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({
        chain: defaultChain,
        transport: custom(provider),
        account: wallet.address as Address,
      })
      setWeb3Wallet(walletClient)
      return
    }
    return
  }

  useEffect(() => {
    if (!authenticated) {
      setWeb3Wallet(null)
      return
    }
    if (!web3Wallet && authenticated) {
      getWallet()
    }
  }, [web3Wallet, authenticated, wallets])

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
    console.log(`smartWallet address ${smartAccountClient.account.address}`)
    //@ts-ignore
    setSmartAccountClient(smartAccountClient)
  }

  console.log('wallets', wallets)

  useEffect(() => {
    ;(async () => {
      if (
        authenticated &&
        wallets.some((wallet) => wallet.walletClientType === 'privy') &&
        web3Client === 'etherspot' &&
        !smartAccountClient
      ) {
        const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy')

        console.log(`embedded wallet address ${embeddedWallet?.address}`)

        if (embeddedWallet) {
          getAndStoreSmartAccountClient(embeddedWallet)
        }
      }
    })()
  }, [authenticated, wallets, publicClient, web3Client, smartAccountClient])

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
  const referralCode = useMemo(() => {
    if (profileData?.referralCode) {
      return profileData.referralCode
    }
    return ''
  }, [profileData?.referralCode])

  const referralData = useMemo(() => {
    return {
      referralData: profileData?.referralData ?? [],
      refereeCount: profileData?.referralData ? profileData?.referralData.length : 0,
    }
  }, [profileData?.referralData])

  const refLink = useMemo(
    () => `${process.env.NEXT_PUBLIC_APP_URL}/?r=${referralCode}`,
    [referralCode]
  )

  const disconnectFromPlatform = useCallback(async () => {
    localStorage.removeItem(LOGGED_IN_TO_LIMITLESS)
    localStorage.removeItem(USER_ID)
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
    referralCode,
    refLink,
    bio,
    referralData,
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
    profilePageOpened,
    walletPageOpened,
    setProfilePageOpened,
    setWalletPageOpened,
  }

  return <AccountContext.Provider value={contextProviderValue}>{children}</AccountContext.Provider>
}
