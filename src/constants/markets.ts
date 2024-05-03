import { Market } from '@/types'
import { zeroAddress } from 'viem'
import { base, baseSepolia } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x4585482A258d66b16a95734E86DCA1Ea338AC100', // prod
      // [base.id]: zeroAddress, // dev
      [baseSepolia.id]: zeroAddress,
    },
    conditionId: {
      [base.id]: '0x85b3752114969525a2a84dba1c1f2534bf830e64c1293a758095126a4dd165ba', // prod
      // [base.id]: zeroAddress, // dev
      [baseSepolia.id]: zeroAddress,
    },
    outcomeTokens: ['Yes', 'No'],
    title: 'Will Limitless achieve $10M in volume in the first year since launch?',
    description: `Bet on or against new social prediction market Limitless’ success.`,
    placeholderURI: '/assets/images/markets/market4-placeholder.jpg',
    imageURI: '/assets/images/markets/market4.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market4-og.jpg',
    expirationDate: 'Apr 25 2025',
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
      [baseSepolia.id]: '0x5665E9160Eb557E711482Cca20a31089a24F89d0',
    },
    conditionId: {
      [base.id]: '0x33173bef347cb768b208efd547d445aec0fa1fc16f869093a7783e13ac2c2fff', // prod
      // [base.id]: '0x48f88962935aa6fb26a819ff22dffcda8a251f4e192d988ede363fdb8734c5f3', // dev
      [baseSepolia.id]: '0x2ead7a90a1d0d8cccf11eb8e50f931cfff2e523e9f067765025c097048702517',
    },
    outcomeTokens: ['Yes', 'No'],
    title: 'Will $DEGEN have 1M+ holders by the end of 2024?',
    description:
      'Bet on whether $DEGEN will reach over 1 million holders by the close of 2024! Place your stake and predict the future of the $DEGEN community growth.',
    placeholderURI: '/assets/images/markets/market1-placeholder.jpg',
    imageURI: '/assets/images/markets/market1.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market1-og.jpg',
    expirationDate: '31 Dec',
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
      [baseSepolia.id]: '0xb8e500603DbaDA2172361c978aea5eAbaA12bbC1',
    },
    conditionId: {
      [base.id]: '0xa397e6687681345146d869a05591b002039d1ed88bfc5e871bf36d26cd89e367', // prod
      // [base.id]: '0x42bb72b37a2d8619e1a4ea0634a9df9cbaed5f5cb849cc8122972ef7714dc6a2', // dev
      [baseSepolia.id]: '0x441a0f1e7edb999dee014dc216a61bf57f35e294930a4bb3e1aaac165948697d',
    },
    outcomeTokens: ['Yes', 'No'],
    title: 'Will Farcaster hit 100k WAUs before the end of Farcon?',
    description: `Think Farcaster will hit 100k WAUs before Farcon finishes on May 5? Bet on your belief and see if Farcaster blows up again!`,
    placeholderURI: '/assets/images/markets/market2-placeholder.jpg',
    imageURI: '/assets/images/markets/market2.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market2-og.jpg',
    expirationDate: '5 May',
    // expirationTimestamp: 1714942799000,
    // expired: Date.now() > 1714942799000, // TODO: make dynamic
    expirationTimestamp: 1714597199000, // test
    expired: Date.now() > 1714597199000, // test
    winningOutcomeTokenId: 0,
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
      [baseSepolia.id]: '0x106646bc99c1dEb24BE1EC54a2229956d55F9e17',
    },
    conditionId: {
      [base.id]: '0x1f7ac97795fbb425912193fc477b009cc6d1bc7b503e9dd938b8a3281093a513', // prod
      // [base.id]: '0xc69515f490d8a89ec3bdeef2ed4a52403f3f4521c78a6db4cde0f83447e7f4d2', // dev
      [baseSepolia.id]: '0x8a8e864ce0016717fa1027ef3714506b605e560b88d1914f47b448c8333491c9',
    },
    outcomeTokens: ['Yes', 'No'],
    title: 'Will $ONCHAIN hit $100M FDV in May?',
    description: `Will $ONCHAIN reach a $100M FDV in May? Place your bets today!`,
    placeholderURI: '/assets/images/markets/market3-placeholder.jpg',
    imageURI: '/assets/images/markets/market3.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market3-og.jpg',
    expirationDate: '31 May',
    expirationTimestamp: 1717189199000,
    expired: Date.now() > 1717189199000, // TODO: make dynamic
    creator: {
      name: '/onchain',
      imageURI: '/assets/images/markets/onchain.jpg',
      link: 'https://warpcast.com/~/channel/onchain',
    },
    tags: ['Onchain', 'Farcaster', 'Memecoins', 'Base'],
  },
]
