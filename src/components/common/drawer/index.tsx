import React, { PropsWithChildren, ReactNode, useMemo } from 'react'
import { Drawer } from 'vaul'
import { h1Regular, headline } from '@/styles/fonts/fonts.styles'

type MobileDrawerProps = {
  trigger: ReactNode
  title?: string
  variant: 'blue' | 'common' | 'black'
  onClose?: () => void
}

export default function MobileDrawer({
  trigger,
  title,
  children,
  variant,
  onClose,
}: PropsWithChildren<MobileDrawerProps>) {
  const bgColor = useMemo(() => {
    if (variant === 'black') {
      return 'var(--chakra-colors-grey-50)'
    }
    return variant === 'blue' ? 'var(--chakra-colors-blue-500)' : 'var(--chakra-colors-grey-100)'
  }, [variant])

  const grabberBgColor =
    variant === 'blue' ? 'var(--chakra-colors-blue-400)' : 'var(--chakra-colors-grey-300)'

  const titleColor = variant === 'blue' ? 'white' : 'var(--chakra-colors-grey.800)'

  return (
    <Drawer.Root shouldScaleBackground onClose={onClose}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 400,
          }}
        />
        <Drawer.Content
          style={{
            background: bgColor,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100dvh - 36px)',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 500,
            outline: 'none',
          }}
        >
          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                margin: '8px auto',
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                background: grabberBgColor,
              }}
            />
            <div
              style={{
                margin: '0 auto',
                maxHeight: 'calc(100dvh - 68px)',
                overflowY: 'auto',
              }}
            >
              {title && (
                <Drawer.Title
                  style={{
                    marginBottom: '32px',
                    marginTop: '28px',
                    padding: '0 16px',
                    ...(variant === 'blue' ? { ...headline } : { ...h1Regular }),
                    color: titleColor,
                  }}
                >
                  {title}
                </Drawer.Title>
              )}
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
