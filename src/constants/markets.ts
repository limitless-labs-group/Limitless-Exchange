import { Market } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x6C53D4Fd4ABac77EeDb3CE862b8a6C4143d66Ca6',
      [baseSepolia.id]: '0x5665E9160Eb557E711482Cca20a31089a24F89d0',
    },
    outcomeTokens: ['Yes', 'No'],
    questionId: '0x0000000000000000000000000000000000000031373133333538303738333230',
    conditionId: '0x2ead7a90a1d0d8cccf11eb8e50f931cfff2e523e9f067765025c097048702517',
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
    questionId: '0x0000000000000000000000000000000000000031373133333538313235353931',
    conditionId: '0x441a0f1e7edb999dee014dc216a61bf57f35e294930a4bb3e1aaac165948697d',
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
    questionId: '0x0000000000000000000000000000000000000031373133333538323632353531',
    conditionId: '0x8a8e864ce0016717fa1027ef3714506b605e560b88d1914f47b448c8333491c9',
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
    questionId: '0x0000000000000000000000000000000000000031373133333538353035353837',
    conditionId: '0x930f8638940f38c8338c1c45d5529dc3c7c3dcdd8c21957f621f64d80a68874d',
    title: 'Limitless Demo Market',
    description: `Market for development and testing.`,
    expirationData: '31 Feb',
    creator: {
      name: 'Carlo Miguel Dy',
    },
    closed: true,
  },
]
