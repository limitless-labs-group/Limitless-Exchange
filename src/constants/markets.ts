import { Market } from '@/types'
import { base, baseSepolia } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x0e03edc2a0ba38e803dad62b31b6e6a2f4b216cc',
      [baseSepolia.id]: '0x5665E9160Eb557E711482Cca20a31089a24F89d0',
    },
    outcomeTokens: ['Yes', 'No'],
    questionId: {
      [base.id]: '0x',
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373133333538303738333230',
    },
    conditionId: {
      [base.id]: '0x33173bef347cb768b208efd547d445aec0fa1fc16f869093a7783e13ac2c2fff',
      [baseSepolia.id]: '0x2ead7a90a1d0d8cccf11eb8e50f931cfff2e523e9f067765025c097048702517',
    },
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
      [base.id]: '0x2a5254e52e338228dcd82baa4374608bb884e834',
      [baseSepolia.id]: '0xb8e500603DbaDA2172361c978aea5eAbaA12bbC1',
    },
    outcomeTokens: ['Yes', 'No'],
    questionId: {
      [base.id]: '0x',
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373133333538313235353931',
    },
    conditionId: {
      [base.id]: '0xa397e6687681345146d869a05591b002039d1ed88bfc5e871bf36d26cd89e367',
      [baseSepolia.id]: '0x441a0f1e7edb999dee014dc216a61bf57f35e294930a4bb3e1aaac165948697d',
    },
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
      [base.id]: '0xe47907110663a3f0c06c1929ea52f50bc9821d13',
      [baseSepolia.id]: '0x106646bc99c1dEb24BE1EC54a2229956d55F9e17',
    },
    outcomeTokens: ['Yes', 'No'],
    questionId: {
      [base.id]: '0x',
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373133333538323632353531',
    },
    conditionId: {
      [base.id]: '0x1f7ac97795fbb425912193fc477b009cc6d1bc7b503e9dd938b8a3281093a513',
      [baseSepolia.id]: '0x8a8e864ce0016717fa1027ef3714506b605e560b88d1914f47b448c8333491c9',
    },
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
]
