import { PropsWithChildren, createContext, useCallback, useContext } from 'react'
import { useWeb3Auth } from '@/providers'
import { useEffect, useState } from 'react'
import {
  useAccount as useWagmi,
  useConnect as useConnectWallet,
  useDisconnect as useDisconnectWallet,
} from 'wagmi'
import { Address } from '@/types'
import { defaultChain } from '@/constants'
import { useAmplitude, useEtherspot } from '@/services'

interface IAccountContext {
  isLoggedIn: boolean
  account?: Address
  email?: string
}

const AccountContext = createContext({} as IAccountContext)

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }: PropsWithChildren) => {
  /**
   * WEB3AUTH
   */
  const { provider, web3Auth, isConnected } = useWeb3Auth()

  /**
   * STATE
   */
  const isLoggedIn = isConnected && !!provider
  const { smartWalletAddress: account } = useEtherspot()
  const [email, setEmail] = useState<string | undefined>()
  const { address: web3WalletAddress } = useWagmi()

  useEffect(() => {
    if (isLoggedIn) {
      web3Auth.getUserInfo().then((userInfo) => {
        setEmail(userInfo.email)
        trackSingUp()
      })
    }
  }, [isLoggedIn])

  /**
   * ANALYTICS
   */
  const { trackSignUp: _trackSignUp } = useAmplitude()
  const trackSingUp = useCallback(() => {
    _trackSignUp({
      email,
      web3WalletAddress: !email ? web3WalletAddress : undefined,
      smartWalletAddress: account,
    })
  }, [email, web3WalletAddress, account])

  const contextProviderValue: IAccountContext = {
    isLoggedIn,
    account,
    email,
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
  const { connectAsync: connectWallet, connectors } = useConnectWallet()
  const signIn = useCallback(
    () =>
      connectWallet({
        chainId: defaultChain.id,
        connector: connectors.find((c) => c.id === 'web3auth')!,
      }),
    []
  )

  /**
   * SIGN OUT
   */
  const { disconnectAsync: disconnectWallet } = useDisconnectWallet()
  const signOut = useCallback(async () => disconnectWallet(), [])

  return {
    isLoggedIn,
    signIn,
    signOut,
  }
}
