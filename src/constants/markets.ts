import { Market } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x6C53D4Fd4ABac77EeDb3CE862b8a6C4143d66Ca6',
      [baseSepolia.id]: '0x5665E9160Eb557E711482Cca20a31089a24F89d0',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x',
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
      [base.id]: '0x5cD45975Cd6F0EeE9b92b82862f682BeC50421bE',
      [baseSepolia.id]: '0xb8e500603DbaDA2172361c978aea5eAbaA12bbC1',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x',
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
      [baseSepolia.id]: '0x106646bc99c1dEb24BE1EC54a2229956d55F9e17',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x',
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
      [baseSepolia.id]: '0xDd2Dd848b2b86d6Af3560cC79300c2B96324dFF7',
    },
    outcomeTokens: ['Yes', 'No'],
    conditionId: '0x',
    title: 'Limitless Demo Market',
    description: `Market for development and testing.`,
    expirationData: '31 Feb',
    creator: {
      name: 'Carlo Miguel Dy',
    },
    closed: true,
  },
]
