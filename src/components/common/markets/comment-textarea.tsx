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
import { useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useAccount, useTradingService } from '@/services'
import { useCommentService } from '@/services/CommentService'
import { captionRegular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import Avatar from '../avatar'
import Loader from '../loader'

export default function CommentTextarea() {
  const { profileData, account } = useAccount()
  const [comment, setComment] = useState<string>('')
  const { market, groupMarket } = useTradingService()
  const { createComment, isPostCommentLoading } = useCommentService()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [error, setError] = useState('')

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
    if (isMobile && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }

  const submit = async () => {
    if (!comment || comment.trim() === '') {
      setError('Comment cannot be empty or just whitespace.')
      return
    }
    await createComment({
      content: comment,
      marketSlug:
        market?.marketType === 'group' ? (groupMarket?.slug as string) : (market?.slug as string),
    })
    setComment('')
  }

  useEffect(() => {
    if (isMobile) {
      const adjustViewport = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
      window.addEventListener('resize', adjustViewport)
      adjustViewport()
      return () => window.removeEventListener('resize', adjustViewport)
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
          alignItems={isMobile ? 'center' : 'unset'}
        >
          <Flex justifyContent={isMobile ? 'flex-end' : 'space-between'}>
            {!isMobile ? (
              <HStack gap='4px'>
                <Avatar account={account as string} avatarUrl={profileData?.pfpUrl} />
                <Text {...captionRegular}>{profileData?.displayName ?? profileData?.username}</Text>
              </HStack>
            ) : null}
            <Button
              variant='grey'
              minW='58px'
              onClick={submit}
              isDisabled={isPostCommentLoading || comment.length === 0}
            >
              {isPostCommentLoading ? <Loader /> : isMobile ? 'Post' : 'Add'}
            </Button>
          </Flex>
          <Textarea
            value={comment}
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
              setComment(sanitized)
            }}
            rows={isMobile ? 1 : 2}
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
                {comment.length}/140
              </FormHelperText>
            </HStack>
          ) : null}
        </Flex>
      </VStack>
    </FormControl>
  )
}
