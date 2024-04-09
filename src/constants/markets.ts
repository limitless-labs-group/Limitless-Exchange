import { Market } from '@/types'
import { base, baseSepolia, goerli } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x6C53D4Fd4ABac77EeDb3CE862b8a6C4143d66Ca6',
      [baseSepolia.id]: '0x00463ab15E35c3f4F2E529BA172FF48D90eE57e2',
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
      [base.id]: '0x25da81cF41e5292203d46311635FF59D2F87bE3E',
      [baseSepolia.id]: '0x4b9b88c6f647506d5e1a5CD498587ED5A44b9E66',
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
      [base.id]: '0x5cD45975Cd6F0EeE9b92b82862f682BeC50421bE',
      [baseSepolia.id]: '0x4c1339ca3421E04707B8a4c12Ec72B6fC8030Ff8',
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
      [base.id]: '0xD2227c9fF2d85EBf3ec15E19E5E4F2eba3e03e76',
      [baseSepolia.id]: '0x4181fe85E069c20a10C0F61177002211BFbDa183',
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
      [base.id]: '0xb1F86e3f6e9c85631D7A012Dd08Fdf4A4746B198',
      [baseSepolia.id]: '0xBDaeF9B4A0317067C6cE09103b21A55bfa664122',
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
