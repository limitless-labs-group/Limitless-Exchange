import { ImageResponse } from 'next/og'
import LimitlessLogo from '@/app/api/og/market/assets/logo'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const referralCode = searchParams.get('r')

  const displayText = referralCode ? `You're invited to explore the future!` : `Limitless Exchange`

  const titleText = referralCode
    ? `Your invite code: ${referralCode}`
    : 'Forecast the future on Limitless, financial prediction market'

  const fontDataBold = await fetch(new URL('./assets/Inter-Bold.ttf', import.meta.url)).then(
    (res) => res.arrayBuffer()
  )
  const fontDataThin = await fetch(new URL('./assets/Inter-Medium.ttf', import.meta.url)).then(
    (res) => res.arrayBuffer()
  )

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
            background: 'linear-gradient(90deg, #FF3756 0%, #FF9200 49.5%, #0FC591 100%)',
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
          ></div>
          <p
            style={{
              color: 'white',
              fontSize: '52px',
              fontWeight: 700,
              textAlign: 'center',
              marginTop: '36px',
              maxWidth: '1000px',
              lineHeight: '1.2',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: 'Inter Bold',
              whiteSpace: 'nowrap',
            }}
          >
            {displayText}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '13px',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.4)',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '34px',
                fontWeight: '500',
                fontFamily: 'Inter Thin',
              }}
            >
              {titleText}
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
