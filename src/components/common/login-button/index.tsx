import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@chakra-ui/react'
import { ClickEvent, SignInEvent, useAmplitude } from '@/services'
import { web3Auth } from '@/providers'
import { ADAPTER_EVENTS } from '@web3auth/base'

export const LoginButton = () => {
  const { trackSignIn, trackClicked } = useAmplitude()

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            style={{
              width: '100%',
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={() => {
                      openConnectModal()
                      trackSignIn(SignInEvent.SignIn)
                      web3Auth.removeAllListeners(ADAPTER_EVENTS.CONNECTED)
                      web3Auth.once(ADAPTER_EVENTS.CONNECTED, async () => {
                        const { typeOfLogin } = await web3Auth.getUserInfo()
                        trackClicked(ClickEvent.SignW3AIn, { option: typeOfLogin })
                      })
                    }}
                    variant='contained'
                    w='full'
                  >
                    Sign in
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type='button'>
                    Wrong network
                  </button>
                )
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type='button'
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button onClick={openAccountModal} type='button'>
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
