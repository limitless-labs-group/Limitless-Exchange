import {
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Textarea,
  FormControl,
  FormHelperText,
} from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ChangeEvent, ClickEvent, useAccount, useAmplitude, useTradingService } from '@/services'
import { captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import Avatar from '../common/avatar'
import Loader from '../common/loader'

export interface ChatTextareaProps {
  onSubmit: () => void
  msg: string
  setMsg: Dispatch<SetStateAction<string>>
  isLoading?: boolean
  rows?: number
}

export const ChatTextarea = ({ onSubmit, msg, setMsg, isLoading, rows }: ChatTextareaProps) => {
  const { loginToPlatform, profileData } = useAccount()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [error, setError] = useState('')
  const { trackClicked, trackChanged } = useAmplitude()
  const { market } = useTradingService()
  const { isLoggedIn } = useAccount()

  const sanitizeInput = (input: string) => {
    const sanitized = DOMPurify.sanitize(input, {
      FORBID_TAGS: [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'applet',
        'form',
        'link',
        'meta',
        'base',
        'svg',
        'math',
      ],
      FORBID_ATTR: ['on*', 'src', 'href', 'style', 'data', 'action', 'formaction', 'xlink:href'],
    })
    return sanitized.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  }

  const handleFocus = () => {
    trackClicked(ClickEvent.ClickOnInputField, {
      currentOpenMarket: market?.slug ?? 'no market',
    })

    if (isMobile && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })

        window.scrollTo({
          top: window.scrollY + 100,
          behavior: 'smooth',
        })
      }, 500)
    }
  }
  const login = () => {
    loginToPlatform()
  }

  const submit = async () => {
    if (!msg || msg.trim() === '') {
      setError('Comment cannot be empty or just whitespace.')
      return
    }
    onSubmit()
    setMsg('')

    trackClicked(ClickEvent.SendMessageClicked, {
      currentOpenMarket: market?.slug ?? 'no market',
    })

    if (isMobile && textareaRef.current) {
      textareaRef.current.blur()
    } else {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  useEffect(() => {
    if (isMobile) {
      const adjustViewport = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && textareaRef.current) {
          setTimeout(() => {
            textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 300)
        }
      }

      window.addEventListener('resize', adjustViewport)
      window.addEventListener('visibilitychange', handleVisibilityChange)

      adjustViewport()

      return () => {
        window.removeEventListener('resize', adjustViewport)
        window.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  const containerBorderStyle = useMemo(() => {
    if (error && !isMobile) {
      return '1px solid var(--chakra-colors-red-300)'
    }
    if (isMobile) {
      return 'unset'
    }
    return '1px solid var(--chakra-colors-grey-300)'
  }, [error])

  const areaBorderStyle = useMemo(() => {
    if (error && isMobile) {
      return '1px solid var(--chakra-colors-red-300)'
    }
    if (isMobile) {
      return '1px solid var(--chakra-colors-grey-300)'
    }
    return 'unset'
  }, [error])

  return (
    <FormControl>
      <VStack w='full' mt='16px'>
        <Flex
          border={containerBorderStyle}
          borderRadius='2px'
          w='full'
          p={!isMobile ? '8px' : 'unset'}
          flexDirection={isMobile ? 'row-reverse' : 'column'}
          gap={isMobile ? '8px' : 'unset'}
        >
          <Flex justifyContent={isMobile ? 'flex-end' : 'space-between'}>
            {!isMobile ? (
              <HStack gap='4px'>
                <Avatar
                  account={
                    (profileData?.displayName ??
                      profileData?.username ??
                      profileData?.account) as string
                  }
                  avatarUrl={profileData?.pfpUrl}
                />
                <Text {...captionRegular}>
                  {profileData?.displayName ?? profileData?.username ?? profileData?.account}
                </Text>
              </HStack>
            ) : null}
            {isLoggedIn ? (
              <Button
                variant='grey'
                minW='58px'
                onClick={submit}
                isDisabled={isLoading || msg.length === 0}
              >
                {isLoading ? <Loader /> : 'Send'}
              </Button>
            ) : (
              <Button variant='grey' minW='58px' onClick={login}>
                Login
              </Button>
            )}
          </Flex>
          <Textarea
            value={msg}
            placeholder='Share an opinion or stfo...'
            maxLength={140}
            contentEditable={true}
            ref={textareaRef}
            onFocus={handleFocus}
            resize='none'
            whiteSpace='pre-wrap'
            wordBreak='break-word'
            overflow='auto'
            wrap='soft'
            onChange={(e) => {
              const sanitized = sanitizeInput(e.target.value)
              if (sanitized || sanitized.trim()) {
                setError('')
              }

              if (msg === '' && sanitized.trim() !== '') {
                trackChanged(ChangeEvent.StartTyping, {
                  currentOpenMarket: market?.slug ?? 'no market',
                })
              }

              setMsg(sanitized)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (msg.trim() !== '' && !isLoading) {
                  submit()
                  if (isMobile && textareaRef.current) {
                    textareaRef.current.blur()
                  }
                }
              }
            }}
            rows={rows ?? (isMobile ? 1 : 2)}
            w='full'
            p={isMobile ? '5px 12px' : '0 0 0 20px'}
            variant='unstyled'
            focusBorderColor={isMobile ? 'var(--chakra-colors-grey-300)' : 'transparent'}
            border={areaBorderStyle}
            borderRadius='2px'
            {...paragraphRegular}
            _hover={{ borderColor: isMobile ? 'var(--chakra-colors-grey-300)' : 'transparent' }}
            _focusVisible={{ outline: 'none' }}
            _placeholder={{ ...paragraphRegular, color: 'grey.500' }}
          />
          {!isMobile ? (
            <HStack justifyContent='space-between'>
              <Text fontSize='12px' lineHeight='12px' mt='8px' color='red.300'>
                {error ?? ''}
              </Text>
              <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                {msg.length}/140
              </FormHelperText>
            </HStack>
          ) : null}
        </Flex>
      </VStack>
    </FormControl>
  )
}
