import { Box, Button, HStack, Icon, Slide, Text, useDisclosure } from '@chakra-ui/react'
import { ClickEvent, useAmplitude, useHistory, useTradingService } from '@/services'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import { defaultChain } from '@/constants'
import { Market } from '@/types'
import WinIcon from '@/resources/icons/win-icon.svg'
import { NumberUtil } from '@/utils'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import '@/app/style.css'
import { isMobile } from 'react-device-detect'

interface MobileTradeButtonProps {
  market: Market | null
}

export function MobileTradeButton({ market }: MobileTradeButtonProps) {
  const { redeem: claim, status } = useTradingService()
  const { trackClicked } = useAmplitude()
  const { positions } = useHistory()
  const router = useRouter()
  const positionToClaim = useMemo(
    () =>
      positions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase() &&
          position.outcomeIndex === market.winningOutcomeIndex &&
          market.expired
      )?.[0],
    [positions, market]
  )

  const { isOpen: isClaimMenuOpen, onToggle: toggleClaimMenu } = useDisclosure()

  const hasPositions = useMemo(() => {
    const position = positions?.filter(
      (position) =>
        market?.expired &&
        position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase()
    )
    if (position?.length) {
      return position
    }
  }, [market?.address, market?.expired, positions])

  const buttonText = useMemo(() => {
    if (!positionToClaim) {
      return <Text fontWeight={500}>Explore Open Markets</Text>
    }
    if (positionToClaim) {
      return (
        <HStack gap='8px'>
          <Icon as={WinIcon} />
          <Text fontWeight={500}>Claim Reward</Text>
        </HStack>
      )
    }
    if (hasPositions) {
      return (
        <Text color='white'>
          Lost {`${NumberUtil.formatThousands(hasPositions[0].outcomeTokenAmount, 4)}`}{' '}
          {market?.tokenTicker[defaultChain.id]}
        </Text>
      )
    }
    if (status === 'Loading') {
      return <Text fontWeight={500}>Processing claim</Text>
    }
  }, [hasPositions, market?.tokenTicker, positionToClaim, status])

  const buttonColor = useMemo(() => {
    if (!positionToClaim) {
      return 'black'
    }
    if (hasPositions) {
      return 'green.500'
    }
    return 'red.500'
  }, [positionToClaim, hasPositions])

  const action = () => {
    if (!positionToClaim) {
      return router.push('/')
    }
    if (hasPositions) {
      return toggleClaimMenu()
    }
    return undefined
  }

  return (
    <>
      <Button
        variant='contained'
        w='full'
        mt='32px'
        h='48px'
        bg={buttonColor}
        justifyContent='space-between'
        onClick={action}
        _hover={{
          bg: buttonColor,
        }}
      >
        Market is closed
        {buttonText}
      </Button>
      {isClaimMenuOpen && (
        <Box
          position='fixed'
          top={0}
          left={0}
          bottom={0}
          w='full'
          zIndex={100}
          bg='rgba(0, 0, 0, 0.3)'
          mt='20px'
          animation='fadeIn 0.5s'
        ></Box>
      )}
      <Slide
        direction='bottom'
        in={isClaimMenuOpen}
        style={{
          zIndex: 100,
          marginTop: '20px',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          transition: '0.1s',
        }}
        onClick={toggleClaimMenu}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          bg='green.500'
          p='16px'
          pt='24px'
          w='full'
          color='white'
        >
          <Text fontWeight={500} mt='16px'>
            Market is closed
          </Text>
          <HStack mt='12px' gap='4px'>
            <Text fontWeight={500}>Your prediction of </Text>
            {hasPositions?.[0].outcomeIndex ? (
              <ThumbsDownIcon width={16} height={16} />
            ) : (
              <ThumbsUpIcon width={16} height={16} />
            )}
            <Text fontWeight={500}>{hasPositions?.[0].outcomeIndex ? 'No' : 'Yes'}</Text>
            <Text fontWeight={500}>did come true</Text>
          </HStack>
          <Button
            variant='white'
            w='full'
            mt='40px'
            onClick={async () => {
              trackClicked(ClickEvent.ClaimRewardOnMarketPageClicked, {
                platform: 'mobile',
                marketAddress: market?.address[defaultChain.id],
              })
              toggleClaimMenu()
              if (positionToClaim) {
                await claim(positionToClaim?.outcomeIndex)
              }
            }}
            isDisabled={status === 'Loading'}
          >
            <Icon as={WinIcon} />
            <Text fontWeight={500}>
              Claim{' '}
              {`${NumberUtil.formatThousands(positionToClaim?.outcomeTokenAmount, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}
            </Text>
          </Button>
        </Box>
      </Slide>
    </>
  )
}
