import { Market } from '@/types'
import { base, baseSepolia, goerli } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x142a8315b74a660a4fe2b75b0878d769a2606c81',
      [baseSepolia.id]: '0xD038ACB7543c8B0cc1E69531d9a4b2FE83Efdf43',
      [goerli.id]: '0x781083809e9cD7218e0796760e938D3320D51eF5',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x1b72c3ee9656b0b8f542a395e5b6b913f8dae48160b27a2cd062ac400a7a3585',
    title: 'Will Eigenlayer launch a token in Q3 2024?',
    imageURI: '/assets/images/market1.jpg',
    description:
      'EigenLayer is a pioneering restaking protocol on Ethereum, allowing ETH native stakers to validate new software modules and earn additional rewards with over $4.8B locked in value and $64.5M raised from top funds like Coinbase Ventures and Polychain Capital.',
    expirationData: 'Sep 31',
    creator: {
      name: 'David Hoffman',
      imageURI: '/assets/images/David-Hoffman.jpg',
      link: 'https://twitter.com/TrustlessState',
    },
  },
  {
    address: {
      [base.id]: '0x5c2015b843e31a025df4951e290239d66d5d03aa',
      [baseSepolia.id]: '0x29D46Df636165B0f8dff998893138780bCc9058D',
      [goerli.id]: '0xdc1FC880012d044526eDfec9a2217AFBccF82D09',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x6e3316fef4d134319ce533b72eba6010f1cc8dccf698b79bc9820f9af06c1c3a',
    title: 'Will SBF get more than 6.5 years in prison?',
    imageURI: '/assets/images/market2.jpg',
    description:
      'FTX fraudster Bankman-Fried seeks less than 7 year sentence, claims he is at risk of ‘harm and extortion’ in prison.',
    expirationData: 'March 28',
    creator: {
      name: 'Tiffany Fong',
      imageURI: '/assets/images/Tiffany-Fong.jpg',
      link: 'https://twitter.com/TiffanyFong_',
    },
    closed: true,
  },
  {
    address: {
      [base.id]: '0xbf4b4f41a3a06cb5135530b663cc1c36441d654e',
      [baseSepolia.id]: '0x9c873d93F4d75CC2AC6203E67dd17F26E7382ba8',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x110f8a415e638e28b52e29bab6f6222cd8fe9473a16a59a50d1d979d9e30d90f',
    title: 'Will Bitcoin achieve a new ATH in April?',
    imageURI: '/assets/images/market3.jpg',
    description: `At this rate, it's highly likely Bitcoin breaks $69,000 before April halving. People have no idea what's happening or what's coming. Prepare mentally for 10k candles a day.`,
    expirationData: 'April 30',
    creator: {
      name: 'Balaji',
      imageURI: '/assets/images/Balaji.jpg',
      link: 'https://twitter.com/balajis',
    },
  },
  {
    address: {
      [base.id]: '0xccf0c57236561418142ca826995d25c250af37cd',
      [baseSepolia.id]: '0x60E8976A4CAa876fc09363132c5Fa36bDF380BDB',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x4426ca37ad3e7392b40dcf01df6f473eaefc07b46f4925e88149207c99bda6f3',
    title: 'Will Ethereum ETF be approved in the first half of 2024?',
    imageURI: '/assets/images/market4.jpg',
    description: `In early 2024, over 10 spot Bitcoin exchange-traded funds (ETFs) were approved by the SEC, causing a dramatic rise in Bitcoin's price and attracting tens of billions in investment, leading to speculation about the possibility of Ethereum ETFs as well.`,
    expirationData: 'June 30',
    creator: {
      name: 'Gabriel Haines',
      imageURI: '/assets/images/Gabriel-Haines.jpg',
      link: 'https://twitter.com/gabrielhaines',
    },
  },
  {
    address: {
      [base.id]: '0xe7b894cc9f5f44fe3180d4a176e3cdeee20f4312',
      [baseSepolia.id]: '0xE8602A7dCFD2F5726Db8F6D351b49CF4543e62f8',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x453c4da16ea2a1aaaeba21d60abbbc9ede86390bdb94ef21c39997e91cd22b7a',
    title: 'Limitless Demo Market',
    description: `Market for development and testing.`,
    expirationData: '31 Feb',
    creator: {
      name: 'Carlo Miguel Dy',
    },
    closed: true,
  },
]
