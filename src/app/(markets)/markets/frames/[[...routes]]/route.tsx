/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { Address, erc20Abi, formatUnits, getAddress, getContract, parseUnits } from 'viem'
import { getQuote, getViemClient } from '@/app/(markets)/markets/frames/[[...routes]]/queries'
import { Market } from '@/types'
import { fixedProductMarketMakerABI } from '@/contracts'
import { TradeQuotes } from '@/services'
import { readFile } from 'fs/promises'
import path from 'path'
import { defaultChain } from '@/constants'
import { NumberUtil } from '@/utils'

const app = new Frog<{
  State: {
    market: Market
    addressOfMarket: Address

    accountToInvestmentAmountRaw?: string | undefined
    quote?: TradeQuotes | undefined | null
    outcomeIndex?: number | undefined
  }
}>({
  title: '',
  assetsPath: '/',
  basePath: '/markets/frames',
  // @ts-ignore
  initialState: async (c) => {
    // We always expect that `c.req.param('address')` is not null.
    // Therefore, all the routes must have `/:address` path parameter.
    // See how `initialState` is used: https://www.youtube.com/watch?v=jFhe-WLm0C8&t=1s

    const addressOfMarket = getAddress(c.req.param('address'))

    const marketData = await fetch(`${apiUrl}/markets/${addressOfMarket}`, {
      method: 'GET',
    })

    // @NOTE: the type of the `market` here was defined as `Market | null` before. Please check.
    const market: Market = await marketData.json()

    const contract = getContract({
      address: addressOfMarket,
      abi: fixedProductMarketMakerABI,
      client: getViemClient(),
    })

    const collateralDecimals = market.collateralToken.decimals
    const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`
    const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)
    const outcomeTokenAmountYesBI = (await contract.read.calcBuyAmount([
      collateralAmountBI,
      0,
    ])) as bigint
    const outcomeTokenAmountNoBI = (await contract.read.calcBuyAmount([
      collateralAmountBI,
      1,
    ])) as bigint
    const outcomeTokenAmountYes = formatUnits(outcomeTokenAmountYesBI, collateralDecimals)
    const outcomeTokenAmountNo = formatUnits(outcomeTokenAmountNoBI, collateralDecimals)
    const outcomeTokenPriceYes = Number(collateralAmount) / Number(outcomeTokenAmountYes)
    const outcomeTokenPriceNo = Number(collateralAmount) / Number(outcomeTokenAmountNo)
    const prices = [outcomeTokenPriceYes, outcomeTokenPriceNo]

    const sum = prices[0] + prices[1]
    const outcomeTokensPercentYes = +((prices[0] / sum) * 100).toFixed(1)
    const outcomeTokensPercentNo = +((prices[1] / sum) * 100).toFixed(1)

    const pricesFinal = [outcomeTokensPercentYes, outcomeTokensPercentNo]

    const marketFinal = {
      ...market,
      prices: pricesFinal,
    }

    return { market: marketFinal, addressOfMarket }
  },
  imageOptions: async () => {
    const localFont = await readFile(
      path.join(process.cwd(), '/src/resources/HelveticaNeueMedium.ttf')
    )

    return {
      fonts: [
        {
          name: 'Helvetica',
          data: localFont,
        },
      ],
    }
  },
})

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

app
  .frame('/initial/:address', async (c) => {
    const { market, addressOfMarket } = c.previousState
    return c.res({
      browserLocation: `https://limitless.exchange/markets/${addressOfMarket}`,
      action: `/approve/${c.req.param('address')}`,
      image: `/initial/${c.req.param('address')}/img`,
      intents: [
        // eslint-disable-next-line react/jsx-key
        <TextInput placeholder={`Enter amount ${market.collateralToken.symbol}`} />,
        // eslint-disable-next-line react/jsx-key
        <Button value='buyYes'>Yes</Button>,
        // eslint-disable-next-line react/jsx-key
        <Button value='buyNo'>No</Button>,
        // eslint-disable-next-line react/jsx-key
        <Button.Link href={`https://limitless.exchange/markets/${addressOfMarket}`}>
          Open Limitless
        </Button.Link>,
      ],
      title: market.title,
    })
  })
  .image('/initial/:address/img', (c) => {
    // @ts-ignore
    const { market } = c.previousState
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <div
          style={{
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 60,
            backgroundColor: '#0000EE',
            height: '100%',
            padding: '5% 4%',
            justifyContent: 'space-between',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '80px',
            }}
          >
            <div
              style={{
                display: 'flex',
                color: 'white',
                fontWeight: 500,
              }}
            >
              {market.title}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <img src='/arrow.svg' alt='logo' style={{ width: '396px', height: '81px' }} />
              <span>Yes {market.prices[0]}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
              src='/logo-white-farcaster.svg'
              alt='logo'
              style={{ width: '333px', height: '96px' }}
            />
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src='/liquidity-icon.svg'
                  alt='liquidity'
                  style={{ width: '40px', height: '40px' }}
                />
                <span
                  style={{
                    color: 'white',
                    fontSize: '40px',
                  }}
                >
                  {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
                  {market.collateralToken.symbol}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src='/calendar-icon.svg'
                  alt='liquidity'
                  style={{ width: '40px', height: '40px' }}
                />
                <span
                  style={{
                    color: 'white',
                    fontSize: '40px',
                  }}
                >
                  {market.expirationDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    })
  })

app
  .frame('/approve/:address', async (c) => {
    const {
      buttonValue,
      // @ts-ignore
      frameData: { inputText },
    } = c
    const { market, addressOfMarket } = await c.deriveState(async (previousState) => {
      const accountToInvestmentAmountRaw = inputText || '1'
      previousState.accountToInvestmentAmountRaw = accountToInvestmentAmountRaw

      const values = await getQuote(
        previousState.market as Market,
        accountToInvestmentAmountRaw,
        previousState.market.collateralToken.decimals,
        buttonValue === 'buyYes' ? 0 : 1,
        previousState.market?.prices as number[]
      )
      previousState.quote = values
      previousState.outcomeIndex = buttonValue === 'buyYes' ? 0 : 1
    })

    return c.res({
      action: `/buy/${c.req.param('address')}`,
      image: `/approve/${c.req.param('address')}/img`,
      intents: [
        // eslint-disable-next-line react/jsx-key
        <Button.Transaction target={`/approve-tx/${c.req.param('address')}`}>
          Approve Transaction
        </Button.Transaction>,
        // eslint-disable-next-line react/jsx-key
        <Button.Link href={`https://limitless.exchange/markets/${addressOfMarket}`}>
          Open Limitless
        </Button.Link>,
      ],
      title: market.title,
    })
  })
  .image('/approve/:address/img', (c) => {
    // @ts-ignore
    const { quote, market } = c.previousState
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <div
          style={{
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 60,
            backgroundColor: '#0000EE',
            height: '100%',
            padding: '5% 4%',
            justifyContent: 'space-between',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '56px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'Helvetica',
                color: 'white',
                fontWeight: 500,
              }}
            >
              Approve transaction?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '42px' }}>
              <div style={{ display: 'flex', gap: '84px', width: '80%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>Avg. Price</span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.outcomeTokenPrice).toFixed(6) : 0}{' '}
                    {market.collateralToken.symbol || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>Est. ROI</span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.roi).toFixed(2) : 0}%
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '84px', width: '80%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    Potential Return
                  </span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.outcomeTokenAmount).toFixed(6) : 0}{' '}
                    {market.collateralToken.symbol}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>Price Impact</span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.priceImpact).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <img
            src='/logo-white-farcaster.svg'
            alt='logo'
            style={{ width: '333px', height: '96px' }}
          />
        </div>
      ),
    })
  })

app.transaction('/approve-tx/:address', (c) => {
  const { addressOfMarket, accountToInvestmentAmountRaw, market } = c.previousState
  if (!accountToInvestmentAmountRaw) return c.error({ message: 'No text input!' })

  const accountToInvestmentAmountBI = parseUnits(
    accountToInvestmentAmountRaw,
    market.collateralToken.decimals
  )
  return c.contract({
    abi: erc20Abi,
    functionName: 'approve',
    args: [addressOfMarket as Address, accountToInvestmentAmountBI],
    chainId: `eip155:${defaultChain.id}`,
    to: market.collateralToken.address,
  })
})

app
  .frame('/buy/:address', (c) => {
    const { addressOfMarket, market } = c.previousState
    return c.res({
      image: `/buy/${c.req.param('address')}/img`,
      action: `/success/${c.req.param('address')}`,
      intents: [
        // eslint-disable-next-line react/jsx-key
        <Button.Transaction target={`/buy-tx/${c.req.param('address')}`}>Buy</Button.Transaction>,
        // eslint-disable-next-line react/jsx-key
        <Button.Link href={`https://limitless.exchange/markets/${addressOfMarket}`}>
          Open Limitless
        </Button.Link>,
      ],
      title: market?.title,
    })
  })
  .image('/buy/:address/img', (c) => {
    // @ts-ignore
    const { quote, market } = c.previousState
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <div
          style={{
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 60,
            backgroundColor: '#0000EE',
            height: '100%',
            padding: '5% 4%',
            justifyContent: 'space-between',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '56px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'Helvetica',
                color: 'white',
                fontWeight: 500,
              }}
            >
              Sign transaction?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '42px' }}>
              <div style={{ display: 'flex', gap: '84px', width: '80%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>Avg. Price</span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.outcomeTokenPrice).toFixed(6) : '0.00'}{' '}
                    {market.collateralToken.symbol}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>Est. ROI</span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.roi).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '84px', width: '80%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    Potential Return
                  </span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.outcomeTokenAmount).toFixed(6) : '0.00'}{' '}
                    {market.collateralToken.symbol}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>Price Impact</span>
                  <span style={{ fontSize: '40px', fontFamily: 'Helvetica' }}>
                    {quote ? (+quote.priceImpact).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <img
            src='/logo-white-farcaster.svg'
            alt='logo'
            style={{ width: '333px', height: '96px' }}
          />
        </div>
      ),
    })
  })

app.transaction('/buy-tx/:address', async (c) => {
  const { addressOfMarket, outcomeIndex, accountToInvestmentAmountRaw, market } = c.previousState
  if (outcomeIndex === undefined || accountToInvestmentAmountRaw === undefined)
    return c.error({ message: 'Insufficient parameters' })
  const client = getViemClient()

  const accountToInvestmentAmountBI = parseUnits(
    accountToInvestmentAmountRaw,
    market.collateralToken.decimals
  )

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

app
  .frame('/success/:address', async (c) => {
    const { addressOfMarket } = c.previousState
    return c.res({
      browserLocation: `https://limitless.exchange/markets/${addressOfMarket}`,
      image: `/success/${c.req.param('address')}/img`,
      intents: [
        // eslint-disable-next-line react/jsx-key
        <Button.Link href={`https://limitless.exchange/markets/${addressOfMarket}`}>
          Open Limitless
        </Button.Link>,
      ],
    })
  })
  .image('/success/:address/img', (c) => {
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <div
          style={{
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 60,
            backgroundColor: '#0000EE',
            height: '100%',
            padding: '5% 4%',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              marginTop: '140px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                alignItems: 'center',
              }}
            >
              <img
                src='/success-round-white-icon.svg'
                alt='logo'
                style={{ width: '80px', height: '80px' }}
              />
              <div
                style={{
                  display: 'flex',
                  color: 'white',
                  fontWeight: 500,
                }}
              >
                Prediction confirmed
              </div>
            </div>
          </div>
          <img
            src='/logo-white-farcaster.svg'
            alt='logo'
            style={{ width: '333px', height: '96px', marginTop: '90px' }}
          />
        </div>
      ),
    })
  })

devtools(app, {
  basePath: '/debug', // devtools available at `http://localhost:5173/debug`
  serveStatic,
})

export const GET = handle(app)
export const POST = handle(app)
