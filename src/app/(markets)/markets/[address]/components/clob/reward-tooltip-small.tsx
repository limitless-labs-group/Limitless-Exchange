import {
  Box,
  Divider,
  HStack,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import NextLink from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { formatUnits } from 'viem'
import { ClickEvent, useAmplitude } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

interface RewardTooltipSmallProps {
  market: Market
}

export default function RewardTooltipSmall({ market }: RewardTooltipSmallProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { trackClicked } = useAmplitude()

  const initialFocusRef = useRef(null)
  const popoverContentRef = useRef(null)
  const [isClickOpen, setIsClickOpen] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClickOutside = () => {
    if (isClickOpen) {
      setIsClickOpen(false)
      onClose()
    }
  }
  useOutsideClick({
    ref: popoverContentRef,
    handler: handleClickOutside,
  })

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const url =
    'https://limitlesslabs.notion.site/Limitless-Docs-0e59399dd44b492f8d494050969a1567#19304e33c4b9808498d9ea69e68a0cb4'

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (!isOpen) {
      trackClicked(ClickEvent.RewardsButtonHovered, {
        marketAddress: market?.slug,
      })
    }
    if (!isClickOpen) {
      onOpen()
    }
  }

  const handleLearnMoreClicked = () => {
    trackClicked(ClickEvent.RewardsLearnMoreClicked, {
      marketAddress: market?.slug,
    })
  }

  const handleMouseLeave = () => {
    if (!isClickOpen) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose()
      }, 100)
    }
  }

  return (
    <Popover
      isOpen={isOpen || isClickOpen}
      onOpen={onOpen}
      onClose={() => {
        if (!isClickOpen) {
          onClose()
        }
      }}
      placement='top-start'
      closeOnBlur={false}
      closeOnEsc={false}
      initialFocusRef={initialFocusRef}
      gutter={4}
      modifiers={[
        { name: 'preventOverflow', options: { boundary: 'window' } },
        { name: 'flip', options: { fallbackPlacements: [] } },
        { name: 'offset', options: { offset: [0, 4] } },
      ]}
    >
      <PopoverTrigger>
        <HStack
          gap='4px'
          borderRadius='8px'
          py='4px'
          px='8px'
          bg={isOpen || isClickOpen ? 'blueTransparent.200' : 'blueTransparent.100'}
          cursor='pointer'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image src='/assets/images/gem-icon.svg' width={16} height={16} alt='rewards' />
        </HStack>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          w='auto'
          minW='260px'
          border='none'
          boxShadow='none'
          bg='transparent'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={popoverContentRef}
          mt='-4px'
        >
          <Box
            position='absolute'
            bottom='-4px'
            left='0'
            right='0'
            height='8px'
            bg='transparent'
            onMouseEnter={handleMouseEnter}
          />
          <PopoverBody p='0'>
            <Box
              bg='grey.50'
              border='1px solid'
              borderColor='grey.200'
              boxShadow='0px 1px 4px 0px rgba(2, 6, 23, 0.05)'
              w='260px'
              p='8px'
              rounded='8px'
              minH='128px'
            >
              <Text {...paragraphMedium} as='span'>
                Place limit order near the midpoint to get rewarded.
              </Text>
              <HStack w='full' mt='12px' justifyContent='space-between'>
                <Text {...paragraphRegular}>Daily reward:</Text>
                <Text {...paragraphMedium}>
                  {market.settings?.dailyReward ? (+market.settings.dailyReward).toFixed(0) : '0'}{' '}
                  {market?.collateralToken.symbol}
                </Text>
              </HStack>
              <HStack w='full' justifyContent='space-between'>
                <Text {...paragraphRegular}>Max spread:</Text>
                <Text {...paragraphMedium}>
                  &#177;
                  {new BigNumber(market.settings?.maxSpread ? market.settings.maxSpread : '0')
                    .multipliedBy(100)
                    .toString()}
                  ¢
                </Text>
              </HStack>
              <HStack w='full' justifyContent='space-between'>
                <Text {...paragraphRegular}>Min contracts:</Text>
                <Text {...paragraphMedium}>
                  {formatUnits(
                    BigInt(market.settings?.minSize || '1'),
                    market.collateralToken.decimals || 6
                  )}
                </Text>
              </HStack>
              <Divider my='4px' />
              <Text {...paragraphRegular} color='grey.500'>
                Outside of the range 5¢ - 95¢ you must supply both sides to earn.{' '}
                <NextLink href={url} target='_blank' rel='noopener' passHref>
                  <Link
                    variant='textLinkSecondary'
                    {...paragraphRegular}
                    isExternal
                    color='grey.500'
                    onClick={handleLearnMoreClicked}
                  >
                    Learn more.
                  </Link>
                </NextLink>
              </Text>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
