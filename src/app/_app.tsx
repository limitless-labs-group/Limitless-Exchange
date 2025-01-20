import { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  const user = {
    id: '12345', // Replace with actual user ID
    name: 'John Doe', // Replace with actual user name
    email: 'john.doe@example.com', // Replace with actual user email
    createdAt: Math.floor(new Date('2023-01-01').getTime() / 1000), // Replace with user signup date
  }

  return (
    <>
      {/* Intercom Settings */}
      <Script id='intercom-settings' strategy='beforeInteractive'>
        {`
          window.intercomSettings = {
            api_base: "https://api-iam.intercom.io",
            app_id: ${process.env.NEXT_PUBLIC_INTERCOM_APP_ID},
            user_id: "${user.id}",
            name: "${user.name}",
            email: "${user.email}",
            created_at: ${user.createdAt}
          };
        `}
      </Script>

      {/* Intercom Loader */}
      <Script
        id='intercom-loader'
        src={`https://widget.intercom.io/widget/${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}`}
        strategy='afterInteractive'
      />

      <Component {...pageProps} />
    </>
  )
}
