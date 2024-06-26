/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { Address, erc20Abi, parseUnits } from 'viem'
import { Token } from '@/types'
import { defaultChain } from '@/constants'
import { getQuote, getViemClient } from '@/app/api/frog/[[...routes]]/helpers/queries'
import { fixedProductMarketMakerABI } from '@/contracts'
import { formatFixedEther } from '@/app/api/frog/[[...routes]]/helpers/utils'

type State = {
  marketAddress: string
  collateralToken: Token | null
}

const app = new Frog<{ State: State }>({
  title: 'Market',
  assetsPath: '/',
  basePath: '/api/frog',
  initialState: {
    marketAddress: '',
    collateralToken: null,
  },
})

let accountToInvestmentAmountRaw = '0'
let accountToInvestmentAmountBI: bigint

app.frame('/:address', async (c) => {
  const { deriveState } = c
  const state = deriveState((previousState) => {
    if (!previousState.marketAddress) {
      previousState.marketAddress = c.req.param('address')
    }
  })
  const marketAddress = state.marketAddress || c.req.param('address')
  const marketData = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${marketAddress}`,
    {
      method: 'GET',
    }
  )
  const marketResponse = await marketData.json()
  const tokeData = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tokens`, {
    method: 'GET',
  })
  const tokensResponse: Token[] = await tokeData.json()
  const collateralToken = tokensResponse.find(
    (token) =>
      token.address.toLowerCase() === marketResponse.collateralToken[defaultChain.id].toLowerCase()
  ) as Token
  return c.res({
    browserLocation: `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${marketAddress}`,
    action: `/buy/${marketAddress}`,
    image: (
      <div
        style={{
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          fontSize: 60,
          backgroundImage: `url("https://storage.googleapis.com/limitless-exchange-assets/assets/background.png")`,
          backgroundSize: '100% 100%',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          paddingLeft: '15%',
          paddingRight: '15%',
          maxWidth: '100%',
        }}
      >
        <img src='/logo.png' alt='logo' style={{ width: '185px', height: '40px' }} />
        <span style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '20px' }}>
          Have skin in your beliefs
        </span>
        <span
          style={{
            fontSize: '40px',
            fontWeight: 'bold',
            marginTop: '60px',
            textAlign: 'center',
          }}
        >
          {marketResponse.title}
        </span>
        <div style={{ display: 'flex', gap: '100px', marginTop: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: '#71FF65', fontSize: '28px' }}>
              {marketResponse.prices[0].toFixed(2)}%
            </span>
            <span style={{ color: '#747675', fontSize: '28px' }}>Chance</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: '#71FF65', fontSize: '28px' }}>
              {formatFixedEther(marketResponse.liquidity, collateralToken.decimals)}{' '}
              {collateralToken.symbol}
            </span>
            <span style={{ color: '#747675', fontSize: '28px' }}>Liquidity</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: '#71FF65', fontSize: '28px' }}>
              {marketResponse.expirationDate}
            </span>
            <span style={{ color: '#747675', fontSize: '28px' }}>Deadline</span>
          </div>
        </div>
      </div>
    ),
    intents: [
      // eslint-disable-next-line react/jsx-key
      <TextInput placeholder={`Enter amount ${collateralToken.symbol}`} />,
      // eslint-disable-next-line react/jsx-key
      <Button.Transaction
        target={`/approve-tx/${marketAddress}/${collateralToken.decimals}/${collateralToken.address}`}
      >
        Approve spend
      </Button.Transaction>,
      // eslint-disable-next-line react/jsx-key
      <Button.Link href={`https://limitless.exchange/markets/${marketAddress}`}>
        Open Limitless
      </Button.Link>,
    ],
  })
})

app.transaction('/approve-tx/:address/:decimals/:collateralAddress', (c) => {
  const { inputText } = c
  if (!inputText) {
    throw new Error('Invalid input: inputText must be a non-empty string')
  }
  const decimals = +c.req.param('decimals')
  const investmentAmount = parseUnits(inputText || '1', decimals)
  accountToInvestmentAmountRaw = inputText || '1'
  accountToInvestmentAmountBI = investmentAmount
  const collateralTokenAddress = c.req.param('collateralAddress')
  const marketAddress = c.req.param('address')
  return c.contract({
    abi: erc20Abi,
    functionName: 'approve',
    args: [marketAddress as Address, investmentAmount],
    chainId: `eip155:${defaultChain.id}`,
    to: collateralTokenAddress as Address,
  })
})

app.frame('/buy/:address', async (c) => {
  const { deriveState } = c
  const state = deriveState((previousState) => {
    if (!previousState.marketAddress) {
      previousState.marketAddress = c.req.param('address')
    }
  })
  const marketAddress = state.marketAddress || c.req.param('address')

  const { buttonValue } = c
  const marketData = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${marketAddress}`,
    {
      method: 'GET',
    }
  )
  const marketResponse = await marketData.json()
  const tokeData = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tokens`, {
    method: 'GET',
  })
  const tokensResponse: Token[] = await tokeData.json()

  const collateralToken = tokensResponse.find(
    (token) =>
      token.address.toLowerCase() === marketResponse.collateralToken[defaultChain.id].toLowerCase()
  ) as Token

  const getImageDynamicContent = async () => {
    if (['buyYes', 'buyNo'].includes(buttonValue || '')) {
      const values = await getQuote(
        marketResponse,
        accountToInvestmentAmountRaw,
        collateralToken,
        buttonValue === 'buyYes' ? 0 : 1,
        marketResponse.prices
      )
      return (
        <>
          <div style={{ display: 'flex', gap: '100px', marginTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  color: '#71FF65',
                  fontSize: '28px',
                }}
              >
                {values ? (+values.outcomeTokenPrice).toFixed(6) : 0} {collateralToken.symbol}
              </span>
              <span
                style={{
                  color: '#747675',
                  fontSize: '28px',
                }}
              >
                Avg. Price
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  color: '#71FF65',
                  fontSize: '28px',
                }}
              >
                {values ? (+values.priceImpact).toFixed(2) : '0.00'}%
              </span>
              <span style={{ color: '#747675', fontSize: '28px' }}>Price Impact</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  color: '#71FF65',
                  fontSize: '28px',
                }}
              >
                {values ? (+values.outcomeTokenAmount).toFixed(6) : 0} {collateralToken.symbol}
              </span>
              <span
                style={{
                  color: '#747675',
                  fontSize: '28px',
                }}
              >
                Potential Return
              </span>
            </div>
          </div>
        </>
      )
    }
    return (
      <div style={{ display: 'flex', gap: '100px', marginTop: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#71FF65', fontSize: '28px' }}>
            {marketResponse.prices[0].toFixed(2)}%
          </span>
          <span style={{ color: '#747675', fontSize: '28px' }}>Chance</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              color: '#71FF65',
              fontSize: '28px',
            }}
          >
            {formatFixedEther(marketResponse.liquidity, collateralToken.decimals)}{' '}
            {collateralToken.symbol}
          </span>
          <span style={{ color: '#747675', fontSize: '28px' }}>Liquidity</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#71FF65', fontSize: '28px' }}>
            {marketResponse.expirationDate}
          </span>
          <span style={{ color: '#747675', fontSize: '28px' }}>Deadline</span>
        </div>
      </div>
    )
  }

  const getIntents = () => {
    if (!['buyYes', 'buyNo'].includes(buttonValue || '')) {
      return [
        // eslint-disable-next-line react/jsx-key
        <Button value='buyYes'>Yes {marketResponse.prices[0].toFixed(2)}%</Button>,
        // eslint-disable-next-line react/jsx-key
        <Button value='buyNo'>No {marketResponse.prices[1].toFixed(2)}%</Button>,
        // eslint-disable-next-line react/jsx-key
        <Button.Link href={`https://limitless.exchange/markets/${marketAddress}`}>
          Open Limitless
        </Button.Link>,
      ]
    }
    return [
      // eslint-disable-next-line react/jsx-key
      <Button.Transaction
        target={`/${collateralToken.address}/buy/${buttonValue === 'buyYes' ? '0' : '1'}`}
      >
        Buy
      </Button.Transaction>,
      // eslint-disable-next-line react/jsx-key
      <Button.Link href={`https://limitless.exchange/markets/${marketAddress}`}>
        Open Limitless
      </Button.Link>,
    ]
  }

  return c.res({
    browserLocation: `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${marketAddress}`,
    image: (
      <div
        style={{
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          fontSize: 60,
          backgroundImage: `url("https://storage.googleapis.com/limitless-exchange-assets/assets/background.png")`,
          backgroundSize: '100% 100%',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          paddingLeft: '15%',
          paddingRight: '15%',
          maxWidth: '100%',
        }}
      >
        <img src='/logo.png' alt='logo' style={{ width: '185px', height: '40px' }} />
        <span style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '20px' }}>
          Have skin in your beliefs
        </span>
        <span
          style={{ fontSize: '40px', fontWeight: 'bold', marginTop: '60px', textAlign: 'center' }}
        >
          {marketResponse.title}
        </span>
        {await getImageDynamicContent()}
      </div>
    ),
    intents: getIntents(),
  })
})

app.transaction('/:collateralContract/buy/:index', async (c) => {
  const { previousState } = c
  const client = getViemClient()

  const outcomeIndex = +c.req.param('index')

  const minOutcomeTokensToBuy = await client.readContract({
    address: previousState.marketAddress as Address,
    abi: fixedProductMarketMakerABI,
    functionName: 'calcBuyAmount',
    args: [accountToInvestmentAmountBI, outcomeIndex],
  })

  return c.contract({
    abi: fixedProductMarketMakerABI,
    functionName: 'buy',
    args: [accountToInvestmentAmountBI, outcomeIndex, minOutcomeTokensToBuy],
    chainId: `eip155:${defaultChain.id}`,
    to: previousState.marketAddress as Address,
  })
})

devtools(app, {
  basePath: '/debug', // devtools available at `http://localhost:5173/debug`
  serveStatic,
})

export const GET = handle(app)
export const POST = handle(app)
