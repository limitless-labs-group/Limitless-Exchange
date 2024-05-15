import { Market } from '@/types'
import { zeroAddress } from 'viem'
import { base, baseSepolia } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x4585482A258d66b16a95734E86DCA1Ea338AC100', // prod
      // [base.id]: zeroAddress, // dev
      [baseSepolia.id]: '0x5856Fb2BAB01b7b8330903eCb61374A9b2fb648c',
    },
    questionId: {
      [base.id]: '0x0000000000000000000000000000000000000031373135373333323233363833',
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373135373333323233363833',
    },
    conditionId: {
      [base.id]: '0xcfe3e3db08f015e99b4ec97ad3aa01ee694937ce6af526b8c17a3c844788e311', // prod
      // [base.id]: zeroAddress, // dev
      [baseSepolia.id]: '0xcfe3e3db08f015e99b4ec97ad3aa01ee694937ce6af526b8c17a3c844788e311',
    },
    collateralToken: {
      [base.id]: '0x9e1cfdAdAf5631A40d9AD3f21233a177DF05b674',
      [baseSepolia.id]: '0x9e1cfdAdAf5631A40d9AD3f21233a177DF05b674',
    },
    tokenTicker: 'WETH',
    tokenURI: '/assets/images/tokens/weth.png',
    outcomeTokens: ['Yes', 'No'],
    title: 'Will Limitless achieve $10M in volume in the first year since launch?',
    description: `Bet on or against new social prediction market Limitless’ success.`,
    placeholderURI: '/assets/images/markets/market4-placeholder.jpg',
    imageURI: '/assets/images/markets/market4.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market4-og.jpg',
    expirationDate: 'Apr 25, 2025',
    expirationTimestamp: 1745614799000,
    expired: Date.now() > 1745614799000, // TODO: make dynamic
    creator: {
      name: '@grin',
      imageURI: '/assets/images/markets/grin.jpg',
      link: 'https://warpcast.com/grin',
    },
    tags: ['Limitless', 'KPI driven', 'Grin'],
  },
  {
    address: {
      [base.id]: '0x0e03edc2a0ba38e803dad62b31b6e6a2f4b216cc', // prod
      // [base.id]: '0x07148374d075792850b71e5c660fc84577a004da', // dev
      [baseSepolia.id]: '0xca8cd401a4560a0d1b158f8292b85c78cb38ffc1',
    },
    conditionId: {
      [base.id]: '0x33173bef347cb768b208efd547d445aec0fa1fc16f869093a7783e13ac2c2fff', // prod
      // [base.id]: '0x48f88962935aa6fb26a819ff22dffcda8a251f4e192d988ede363fdb8734c5f3', // dev
      [baseSepolia.id]: '0x84d5169ac2cecd75741c02d71eb85e11c51ec6d8ed442b37e4d3210fbc03192c',
    },
    tokenURI: '/assets/images/tokens/degen.svg',
    tokenTicker: 'DEGEN',
    outcomeTokens: ['Yes', 'No'],
    title: 'Will $DEGEN have 1M+ holders by the end of 2024?',
    description:
      'Bet on whether $DEGEN will reach over 1 million holders by the close of 2024! Place your stake and predict the future of the $DEGEN community growth.',
    placeholderURI: '/assets/images/markets/market1-placeholder.jpg',
    imageURI: '/assets/images/markets/market1.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market1-og.jpg',
    expirationDate: 'Dec 31, 2024',
    expirationTimestamp: 1735682399000,
    expired: Date.now() > 1735682399000, // TODO: make dynamic
    creator: {
      name: '/skininthegame',
      imageURI: '/assets/images/markets/skininthegame.jpg',
      link: 'https://warpcast.com/~/channel/skininthegame',
    },
    tags: ['Degen', 'Memecoins', 'Base', 'Farcaster'],
  },
  {
    address: {
      [base.id]: '0x2a5254e52e338228dcd82baa4374608bb884e834', // prod
      // [base.id]: '0x4e2fb53162472fd19a0175d55c7b11e2e81a17d7', // dev
      [baseSepolia.id]: '0x1a2ba71e69a2ad9ff40555b30586bba0efcd7616',
    },
    conditionId: {
      [base.id]: '0xa397e6687681345146d869a05591b002039d1ed88bfc5e871bf36d26cd89e367', // prod
      // [base.id]: '0x42bb72b37a2d8619e1a4ea0634a9df9cbaed5f5cb849cc8122972ef7714dc6a2', // dev
      [baseSepolia.id]: '0x0779cb01e2e832bddccb7eb9a17e0b01bb005082ac10e48843ee9fffbad59b89',
    },
    outcomeTokens: ['Yes', 'No'],
    tokenTicker: 'REGEN',
    tokenURI: '/assets/images/tokens/regen.svg',
    title: 'Will Farcaster hit 100k WAUs before the end of Farcon?',
    description: `Think Farcaster will hit 100k WAUs before Farcon finishes on May 5? Bet on your belief and see if Farcaster blows up again!`,
    placeholderURI: '/assets/images/markets/market2-placeholder.jpg',
    imageURI: '/assets/images/markets/market2.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market2-og.jpg',
    expirationDate: 'May 5, 2024',
    expirationTimestamp: 1716305451000,
    expired: false, // TODO: make dynamic
    winningOutcomeIndex: 1, // TODO: report winners
    creator: {
      name: '@rev',
      imageURI: '/assets/images/markets/rev.jpg',
      link: 'https://warpcast.com/rev',
    },
    tags: ['Farcaster', 'Warpcast'],
  },
  {
    address: {
      [base.id]: '0xe47907110663a3f0c06c1929ea52f50bc9821d13', // prod
      // [base.id]: '0x883ece27b8021135f494603bd5a1477a8d144c39', // dev
      [baseSepolia.id]: '0x729873aa483ced60acb0b7ad815f14c8a7794930',
    },
    conditionId: {
      [base.id]: '0x1f7ac97795fbb425912193fc477b009cc6d1bc7b503e9dd938b8a3281093a513', // prod
      // [base.id]: '0xc69515f490d8a89ec3bdeef2ed4a52403f3f4521c78a6db4cde0f83447e7f4d2', // dev
      [baseSepolia.id]: '0xf0344b254c603d3d44d38629cd6b0c4c6c3c4115411d41c54e0ce2748072685a',
    },
    tokenTicker: 'HIGHER',
    tokenURI: '/assets/images/tokens/higher.svg',
    outcomeTokens: ['Yes', 'No'],
    title: 'Will $HIGHER hit $100M FDV in May?',
    description: `Will $HIGHER reach a $100M FDV in May? Place your bets today!`,
    placeholderURI: '/assets/images/markets/market3-placeholder.jpg',
    imageURI: '/assets/images/markets/market3.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market3-og.jpg',
    expirationDate: 'May 31, 2024',
    expirationTimestamp: 1716305451000,
    expired: Date.now() > 1716305451000, // TODO: make dynamic
    creator: {
      name: '/onchain',
      imageURI: '/assets/images/markets/onchain.jpg',
      link: 'https://warpcast.com/~/channel/onchain',
    },
    tags: ['Onchain', 'Farcaster', 'Memecoins', 'Base'],
  },
]
