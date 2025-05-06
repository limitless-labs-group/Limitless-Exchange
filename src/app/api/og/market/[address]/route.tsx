import axios from 'axios'
import BigNumber from 'bignumber.js'
import { ImageResponse } from 'next/og'
import { Address, createPublicClient, formatUnits, getContract, http, parseUnits } from 'viem'
import LimitlessLogo from '@/app/api/og/market/assets/logo'
import VolumeIcon from '@/app/api/og/market/assets/volume'
import { defaultChain } from '@/constants'
import { fixedProductMarketMakerABI } from '@/contracts'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

export const runtime = 'edge'

export async function GET(req: Request, { params }: { params: { address: string } }) {
  const fontDataBold = await fetch(new URL('../assets/Inter-Bold.ttf', import.meta.url)).then(
    (res) => res.arrayBuffer()
  )
  const fontDataThin = await fetch(new URL('../assets/Inter-Medium.ttf', import.meta.url)).then(
    (res) => res.arrayBuffer()
  )
  const response = await axios.get<Market>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${params.address}`
  )

  const market = response.data

  let prices: number[] = []

  if (market.expired) {
    if (market.winningOutcomeIndex === 0) {
      prices = [100, 0]
    } else if (market.winningOutcomeIndex === 1) {
      prices = [0, 100]
    } else {
      prices = [50, 50]
    }
  } else if (market.marketType === 'group') {
    prices = []
  } else {
    if (market.tradeType === 'clob') {
      prices = [
        new BigNumber(market.prices[0]).multipliedBy(100).decimalPlaces(0).toNumber(),
        new BigNumber(market.prices[1]).multipliedBy(100).decimalPlaces(0).toNumber(),
      ]
    } else {
      const collateralDecimals = market.collateralToken.decimals
      const collateralAmount = collateralDecimals <= 6 ? `0.0001` : `0.0000001`
      const collateralAmountBI = parseUnits(collateralAmount, collateralDecimals)

      const client = createPublicClient({
        transport: http(process.env.NEXT_PUBLIC_FALLBACK_RPC_URL),
        chain: defaultChain,
      })
      const contract = getContract({
        address: market.address as Address,
        abi: fixedProductMarketMakerABI,
        client,
      })
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

      prices = [
        new BigNumber(outcomeTokenPriceYes).multipliedBy(100).decimalPlaces(0).toNumber(),
        new BigNumber(outcomeTokenPriceNo).multipliedBy(100).decimalPlaces(0).toNumber(),
      ]
    }
  }

  const getColor = () => {
    if (!prices.length) {
      return '#0079FF'
    }
    const yesPrice = prices[0]
    if (yesPrice <= 25) return '#FF3756'
    if (yesPrice <= 50) return '#FF9200'
    return '#0FC591'
  }

  const renderSpeedometer = () => {
    if (prices.length) {
      const diameter = 140
      const strokeWidth = 6
      const radius = diameter / 2 - strokeWidth
      const circumference = Math.PI * radius
      const value = prices[0]
      const progress = (value / 100) * circumference
      const fontSize = 36
      return (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${diameter}px`,
            height: `75px`,
          }}
        >
          <svg
            width='100%'
            height='100%'
            viewBox={`0 ${-strokeWidth} ${diameter} ${diameter / 2 + strokeWidth}`}
          >
            <path
              d={`M${strokeWidth},${diameter / 2} A${radius},${radius} 0 0,1 ${
                diameter - strokeWidth
              },${diameter / 2}`}
              fill='none'
              stroke='#525252'
              strokeWidth={strokeWidth}
              strokeLinecap='round'
            />
            <path
              d={`M${strokeWidth},${diameter / 2} A${radius},${radius} 0 0,1 ${
                diameter - strokeWidth
              },${diameter / 2}`}
              fill='none'
              stroke={getColor()}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
          </svg>
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: '46px',
            }}
          >
            <span
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: `${fontSize}px`,
                fontWeight: 700,
                color: getColor(),
                fontFamily: 'Inter Thin',
                textAlign: 'center',
                marginLeft: '4px',
              }}
            >
              {value}%
            </span>
          </div>
        </div>
      )
    }
    // return null
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          padding: '28px 164px',
        }}
      >
        <div
          style={{
            width: '1200px',
            borderRadius: '100%',
            background:
              market.marketType === 'group'
                ? 'linear-gradient(90deg, #FF3756 0%, #FF9200 49.5%, #0FC591 100%)'
                : getColor(),
            height: '403px',
            opacity: 0.3,
            filter: 'blur(80px)',
            position: 'absolute',
            top: -220,
          }}
        />
        <div
          style={{
            display: 'flex',
            marginLeft: '82px',
          }}
        >
          <LimitlessLogo />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto 0',
          }}
        >
          <div
            style={{
              display: 'flex',
            }}
          >
            {renderSpeedometer()}
          </div>
          <p
            style={{
              color: 'white',
              fontSize: '42px',
              fontWeight: 700,
              textAlign: 'center',
              marginTop: '36px',
              maxWidth: '900px',
              lineHeight: '1.2',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: 'Inter Bold',
            }}
          >
            {market.title}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '36px',
              padding: '12px 24px',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.4)',
              alignItems: 'center',
            }}
          >
            {market.marketType === 'group' && (
              <div
                style={{
                  display: 'flex',
                  border: '3px solid',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '120px',
                  padding: '4px 24px',
                  marginRight: '16px',
                }}
              >
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '24px',
                    fontWeight: '500',
                    fontFamily: 'Inter Thin',
                  }}
                >
                  NegRisk Markets
                </span>
              </div>
            )}
            <VolumeIcon />
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '24px',
                fontWeight: '500',
                fontFamily: 'Inter Thin',
              }}
            >
              Volume {NumberUtil.convertWithDenomination(market.volumeFormatted, 0)}{' '}
              {market.collateralToken.symbol}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter Bold',
          data: fontDataBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter Thin',
          data: fontDataThin,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
