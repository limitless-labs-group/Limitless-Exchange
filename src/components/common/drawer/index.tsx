import { Button, HStack } from '@chakra-ui/react'
import { isNumber } from '@chakra-ui/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  CSSProperties,
} from 'react'
import { Drawer } from 'vaul'
import { useUrlParams } from '@/hooks/use-url-param'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { h1Regular, headline } from '@/styles/fonts/fonts.styles'

type MobileDrawerProps = {
  trigger: ReactNode
  title?: string
  variant: 'blue' | 'common' | 'black'
  onClose?: () => void
  id?: string
  triggerStyle?: React.CSSProperties | undefined
  renderPrevNext?: boolean
}

export default function MobileDrawer({
  trigger,
  title,
  children,
  variant,
  onClose,
  id,
  triggerStyle,
  renderPrevNext = false,
}: PropsWithChildren<MobileDrawerProps>) {
  const searchParams = useSearchParams()
  const drawerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const ref = useRef(false)
  const { trackClicked } = useAmplitude()
  const { updateParams } = useUrlParams()

  const { market: selectedMarket, onOpenMarketPage, markets } = useTradingService()

  useEffect(() => {
    if (ref.current) return
    const market = searchParams.get('market')
    if (market !== null && id !== null && market === id && drawerRef.current) {
      drawerRef.current.click()
      ref.current = true
    }
  }, [id])

  const close = () => {
    if (onClose) {
      onClose()
      updateParams({ market: null, r: null })
    }
  }

  const indexInArray = markets
    ? markets.findIndex((marketInArray) => selectedMarket?.slug === marketInArray.slug)
    : undefined

  const onClickPrevious =
    isNumber(indexInArray) && indexInArray > 0 && markets && renderPrevNext
      ? () => {
          onOpenMarketPage(markets[indexInArray - 1])
          router.push(`?market=${markets[indexInArray - 1].slug}`, { scroll: false })
          trackClicked(ClickEvent.PreviousMarketClick, {
            platform: 'mobile',
          })
        }
      : undefined

  const onClickNext =
    isNumber(indexInArray) && markets && indexInArray < markets.length - 1 && renderPrevNext
      ? () => {
          onOpenMarketPage(markets[indexInArray + 1])
          router.push(`?market=${markets[indexInArray + 1].slug}`, { scroll: false })
          trackClicked(ClickEvent.NextMarketClick, {
            platform: 'mobile',
          })
        }
      : undefined

  const bgColor = useMemo(() => {
    if (variant === 'black') {
      return 'var(--chakra-colors-grey-50)'
    }
    return variant === 'blue' ? 'var(--chakra-colors-blue-500)' : 'var(--chakra-colors-grey-50)'
  }, [variant])

  const grabberBgColor =
    variant === 'blue' ? 'var(--chakra-colors-blue-400)' : 'var(--chakra-colors-grey-200)'

  const titleColor = variant === 'blue' ? 'white' : 'var(--chakra-colors-grey.800)'

  // const [keyboardHeight, setKeyboardHeight] = useState(0)
  //
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.visualViewport) {
  //       const newKeyboardHeight = window.innerHeight - window.visualViewport.height
  //       setKeyboardHeight(newKeyboardHeight > 0 ? newKeyboardHeight : 0)
  //     }
  //   }
  //
  //   handleResize()
  //   const debouncedHandleResize = debounce(handleResize, 100)
  //   window.addEventListener('resize', debouncedHandleResize)
  //   return () => window.removeEventListener('resize', debouncedHandleResize)
  // }, [])

  const drawerStyle = useMemo(
    (): CSSProperties => ({
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 99990,
      outline: 'none',
      touchAction: 'none',
    }),
    [bgColor]
  )

  const contentStyle = useMemo(
    (): CSSProperties => ({
      margin: '0 auto',
      maxHeight: 'calc(100dvh - 68px)',
      overflowY: 'auto',
      // paddingBottom: `${keyboardHeight}px`,
      WebkitOverflowScrolling: 'touch',
      position: 'relative',
      zIndex: 1,
      touchAction: 'pan-y',
    }),
    []
  )

  return (
    <Drawer.Root shouldScaleBackground autoFocus onClose={close}>
      <Drawer.Trigger asChild>
        <button style={{ width: '100%', ...triggerStyle }} ref={drawerRef}>
          {trigger}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 99990,
          }}
        />
        <Drawer.Content style={drawerStyle}>
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
                borderRadius: '8px',
                background: grabberBgColor,
              }}
            />
            {!!onClickPrevious || !!onClickNext ? (
              <HStack w='full' justifyContent='space-between'>
                {onClickPrevious ? (
                  <Button variant='transparentGreyText' onClick={onClickPrevious}>
                    <ArrowLeftIcon width={24} height={24} />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}
                {onClickNext ? (
                  <Button variant='transparentGreyText' onClick={onClickNext}>
                    Next
                    <ArrowRightIcon width={24} height={24} />
                  </Button>
                ) : (
                  <div />
                )}
              </HStack>
            ) : null}
            <div style={contentStyle}>
              <>
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
                    <>{title}</>
                  </Drawer.Title>
                )}
              </>
              <>{children}</>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
