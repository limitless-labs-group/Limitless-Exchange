import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector'
import { Web3Auth } from '@web3auth/modal'
import { LOGIN_MODAL_EVENTS } from '@web3auth/ui'
import { CHAIN_NAMESPACES, CustomChainConfig, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { MetamaskAdapter } from '@web3auth/metamask-adapter'
import { CoinbaseAdapter } from '@web3auth/coinbase-adapter'
import { defaultChain } from '@/constants'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAccount as useWagmi } from 'wagmi'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { OpenEvent, useAmplitude } from '@/services'

const chainConfig: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x' + defaultChain.id.toString(16),
  displayName: defaultChain.name,
  rpcTarget: defaultChain.rpcUrls.default.http[0],
  blockExplorerUrl: defaultChain.blockExplorers.default.url,
  tickerName: defaultChain.nativeCurrency.name,
  ticker: defaultChain.nativeCurrency.symbol,
  decimals: defaultChain.nativeCurrency.decimals,
}

const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } })

export const web3Auth = new Web3Auth({
  privateKeyProvider,
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  chainConfig,
  uiConfig: {
    loginMethodsOrder: ['farcaster', 'google', 'twitter', 'discord'],
    defaultLanguage: 'en',
    modalZIndex: '2147483647',
    appName: 'Limitless',
    mode: 'light',
    theme: { primary: '#000' },
    logoLight: 'https://limitless-web.vercel.app/assets/images/logo.svg',
    useLogoLoader: true,
    uxMode: global?.window && window.innerWidth <= 800 ? 'redirect' : 'popup',
  },
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  // enableLogging: true,
})

/**
 * METAMASK
 */
const metamaskAdapter = new MetamaskAdapter({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  sessionTime: 3600 * 3,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
})
web3Auth.configureAdapter(metamaskAdapter)

/**
 * COINBASE
 */
const coinbaseAdapter = new CoinbaseAdapter({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  sessionTime: 3600 * 3,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
})
web3Auth.configureAdapter(coinbaseAdapter)

/**
 * WALLET CONNECT
 */
// const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''
// const defaultWcSettings = await getWalletConnectV2Settings(
//   'eip155',
//   [defaultChain.id.toString()],
//   walletConnectProjectId
// )
// const walletConnectModal = new WalletConnectModal({
//   projectId: walletConnectProjectId,
// })
// const walletConnectV2Adapter = new WalletConnectV2Adapter({
//   adapterSettings: { qrcodeModal: walletConnectModal, ...defaultWcSettings.adapterSettings },
//   loginSettings: { ...defaultWcSettings.loginSettings },
// })
// web3auth.configureAdapter(walletConnectV2Adapter)

// Add openlogin adapter for customisations
// const openloginAdapterInstance = new OpenloginAdapter({
//   privateKeyProvider,
//   adapterSettings: {
//     //   network: 'sapphire_devnet',
//     //   uxMode: 'popup',
//     //   loginConfig: {
//     //     discord: {
//     //       name: 'Limitless',
//     //       verifier: 'limitless-discord',
//     //       typeOfLogin: 'discord',
//     //       clientId: '1186736076539314317',
//     //     },
//     //   },

//     whiteLabel: {
//       appName: 'Limitless',
//       appUrl: 'https://limitless.network',
//       logoLight: 'https://t.ly/sUjuW',
//       defaultLanguage: 'en',
//       mode: 'light',
//       theme: { primary: colors.brand },
//       useLogoLoader: true,
//     },
//   },
// })

// web3Auth.configureAdapter(openloginAdapterInstance)

export const web3AuthConnector = Web3AuthConnector({
  web3AuthInstance: web3Auth,
})

interface IWeb3AuthContext {
  isConnected: boolean
  web3Auth: Web3Auth
  provider: IProvider | null
}

const Web3AuthContext = createContext({} as IWeb3AuthContext)

export const useWeb3Auth = () => useContext(Web3AuthContext)

export const Web3AuthProvider = ({ children }: PropsWithChildren) => {
  /**
   * STATE
   */
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<IProvider | null>(null)

  /**
   * INIT
   */
  const { isConnected: isConnectedWagmi } = useWagmi()

  const initWeb3Auth = useCallback(async () => {
    if (!isConnectedWagmi) {
      setProvider(null)
      setIsConnected(false)
      return
    }
    const timeout = Date.now() + 2000
    while ((!web3Auth.provider || !web3Auth.connected) && Date.now() < timeout) {
      await sleep(0.05)
    }
    setProvider(web3Auth.provider)
    setIsConnected(web3Auth.connected)
  }, [isConnectedWagmi])

  useEffect(() => {
    initWeb3Auth()
  }, [isConnectedWagmi])

  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  useEffect(() => {
    web3Auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (visible) => {
      if (visible) {
        trackOpened(OpenEvent.LoginWindowOpened)
      }
    })
  }, [])

  const contextProviderValue: IWeb3AuthContext = {
    isConnected,
    web3Auth,
    provider,
  }

  return (
    <Web3AuthContext.Provider value={contextProviderValue}>{children}</Web3AuthContext.Provider>
  )
}
