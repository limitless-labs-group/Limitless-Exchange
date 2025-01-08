import { TokenLimits } from '@/types/draft'

export const defaultTokenSymbol = 'USDC'
export const defaultProbability = 50
export const defaultMarketFee = 0
export const defaultCreatorId = '1' // Limitless in prod env
export const defaultCategoryId = '2' // Crypto in prod env

export const tokenLimits: TokenLimits = {
  HIGHER: {
    min: 25000,
    max: 390000,
    step: 1000,
  },
  MFER: {
    min: 12500,
    max: 390000,
    step: 1000,
  },
  DEGEN: {
    min: 39000,
    max: 390000,
    step: 1000,
  },
  ONCHAIN: {
    min: 390000,
    max: 3900000,
    step: 10000,
  },
  WETH: {
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  USDC: {
    min: 100,
    default: 250,
    max: 30000,
    step: 100,
  },
  aBasUSDC: {
    min: 300,
    max: 30000,
    step: 100,
  },
  VITA: {
    min: 150,
    max: 3000,
    step: 25,
  },
  GHST: {
    min: 150,
    max: 3000,
    step: 10,
  },
  BETS: {
    min: 835000,
    max: 8350000,
    step: 5000,
  },
  cbBTC: {
    min: 0.1,
    max: 0.3,
    step: 0.01,
  },
}

export const defaultFormData = {
  deadline: new Date(),
  timezone: 'America/New_York',
  title: '',
  token: { symbol: 'USDC', id: 7 },
  description: '',
  liquidity: tokenLimits[defaultTokenSymbol].default ?? tokenLimits[defaultTokenSymbol].min,
  probability: defaultProbability,
  marketFee: defaultMarketFee,
  tag: [{ id: '149', label: 'Daily', value: 'Daily' }],
  creatorId: defaultCreatorId,
  categoryId: defaultCategoryId,
  ogLogo: undefined,
  isBannered: false,
}

export const selectStyles = {
  menu: {
    backgroundColor: 'var(--chakra-colors-grey-300)',
    color: 'var(--chakra-colors-grey-900)',
  },
  control: {
    backgroundColor: 'var(--chakra-colors-grey-100)',
    color: 'var(--chakra-colors-grey-900)',
  },
  singleValue: {
    color: 'var(--chakra-colors-grey-900)',
  },
}
