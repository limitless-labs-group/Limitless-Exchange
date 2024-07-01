/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { Address, erc20Abi, parseUnits } from 'viem'
import { Market, Token } from '@/types'
import { TradeQuotes } from '@/services'
import { defaultChain } from '@/constants'
import { getQuote, getViemClient } from '@/app/api/frog/[[...routes]]/helpers/queries'
import { fixedProductMarketMakerABI } from '@/contracts'

const app = new Frog({
  title: 'asd',
  assetsPath: '/',
  basePath: '/api/frog',
})

let accountToInvestmentAmountRaw = '0'
let accountToInvestmentAmountBI: bigint
let addressOfMarket = ''
let market: Market
let collateralToken: Token
let quote: TradeQuotes | null
let outcomeIndex: number

app.frame('/start/:address', async (c) => {
  const marketAddress = c.req.param('address')
  addressOfMarket = marketAddress

  const marketData = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${marketAddress}`,
    {
      method: 'GET',
    }
  )
  const marketResponse = await marketData.json()
  market = marketResponse
  const tokeData = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tokens`, {
    method: 'GET',
  })
  const tokensResponse: Token[] = await tokeData.json()
  const token = tokensResponse.find(
    (token) =>
      token.address.toLowerCase() === marketResponse.collateralToken[defaultChain.id].toLowerCase()
  ) as Token
  collateralToken = token
  return c.res({
    browserLocation: `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${marketAddress}`,
    action: `/approve`,
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
              {+marketResponse.liquidityFormatted} {token.symbol}
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
      <TextInput placeholder={`Enter amount ${token.symbol}`} />,
      // eslint-disable-next-line react/jsx-key
      <Button value='buyYes'>Yes {marketResponse.prices[0].toFixed(2)}%</Button>,
      // eslint-disable-next-line react/jsx-key
      <Button value='buyNo'>No {marketResponse.prices[1].toFixed(2)}%</Button>,
      // eslint-disable-next-line react/jsx-key
      <Button.Link href={`https://limitless.exchange/markets/${marketAddress}`}>
        Open Limitless
      </Button.Link>,
    ],
  })
})

app.frame('/approve', async (c) => {
  const { buttonValue, inputText } = c
  const investmentAmount = parseUnits(inputText || '1', collateralToken.decimals)
  accountToInvestmentAmountRaw = inputText || '1'
  accountToInvestmentAmountBI = investmentAmount
  const values = await getQuote(
    addressOfMarket,
    accountToInvestmentAmountRaw,
    collateralToken,
    buttonValue === 'buyYes' ? 0 : 1,
    market.prices
  )
  quote = values
  outcomeIndex = buttonValue === 'buyYes' ? 0 : 1

  return c.res({
    action: `/buy`,
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
          {market.title}
        </span>
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
      </div>
    ),
    intents: [
      // eslint-disable-next-line react/jsx-key
      <Button.Transaction target='/approve-tx'>Approve Transaction</Button.Transaction>,
      // eslint-disable-next-line react/jsx-key
      <Button.Link href={`https://limitless.exchange/markets/${addressOfMarket}`}>
        Open Limitless
      </Button.Link>,
    ],
  })
})

app.transaction('/approve-tx', (c) => {
  return c.contract({
    abi: erc20Abi,
    functionName: 'approve',
    args: [addressOfMarket as Address, accountToInvestmentAmountBI],
    chainId: `eip155:${defaultChain.id}`,
    to: collateralToken.address as Address,
  })
})

app.frame('/buy', (c) => {
  return c.res({
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
          {market.title}
        </span>
        <div style={{ display: 'flex', gap: '100px', marginTop: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: '#71FF65',
                fontSize: '28px',
              }}
            >
              {quote ? (+quote.outcomeTokenPrice).toFixed(6) : 0} {collateralToken.symbol}
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
              {quote ? (+quote.priceImpact).toFixed(2) : '0.00'}%
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
              {quote ? (+quote.outcomeTokenAmount).toFixed(6) : 0} {collateralToken.symbol}
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
      </div>
    ),
    intents: [
      // eslint-disable-next-line react/jsx-key
      <Button.Transaction target='/buy-tx'>Buy</Button.Transaction>,
      // eslint-disable-next-line react/jsx-key
      <Button.Link href={`https://limitless.exchange/markets/${addressOfMarket}`}>
        Open Limitless
      </Button.Link>,
    ],
  })
})
app.transaction('/buy-tx', async (c) => {
  const client = getViemClient()

  const minOutcomeTokensToBuy = await client.readContract({
    address: addressOfMarket as Address,
    abi: fixedProductMarketMakerABI,
    functionName: 'calcBuyAmount',
    args: [accountToInvestmentAmountBI, outcomeIndex],
  })

  return c.contract({
    abi: fixedProductMarketMakerABI,
    functionName: 'buy',
    args: [accountToInvestmentAmountBI, outcomeIndex, minOutcomeTokensToBuy],
    chainId: `eip155:${defaultChain.id}`,
    to: addressOfMarket as Address,
  })
})

devtools(app, {
  basePath: '/debug', // devtools available at `http://localhost:5173/debug`
  serveStatic,
})

export const GET = handle(app)
export const POST = handle(app)
