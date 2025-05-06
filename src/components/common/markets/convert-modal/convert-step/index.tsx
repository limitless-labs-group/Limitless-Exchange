import { Box, Button, Flex, HStack, Link, Spacer, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import NextLink from 'next/link'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { ClobPositionWithTypeAndSelected } from '@/components/common/markets/convert-modal/convert-modal-content'
import ConvertPosition from '@/components/common/markets/convert-modal/convert-position'
import NumberInputWithButtons from '@/components/common/number-input-with-buttons'
import { useTradingService } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface ConvertStepProps {
  positions: ClobPositionWithTypeAndSelected[]
  setConvertPositions: (val: ClobPositionWithTypeAndSelected[]) => void
  maxShares: string
  sharesToConvert: string
  setSharesToConvert: (val: string) => void
  onReviewClick: () => void
}

export default function ConvertStep({
  positions,
  setConvertPositions,
  maxShares,
  sharesToConvert,
  setSharesToConvert,
  onReviewClick,
}: ConvertStepProps) {
  const { market } = useTradingService()

  const renderButtonContent = (title: number) => {
    if (title === 100) {
      if (isMobile) {
        return 'MAX'
      }
      const balanceToShow = NumberUtil.formatThousands(
        maxShares,
        market?.collateralToken.symbol === 'USDC' ? 1 : 6
      )
      return `MAX: ${balanceToShow}`
    }
    return `${title}%`
  }

  const handlePercentButtonClicked = (value: number) => {
    // trackClicked(ClickEvent.TradingWidgetPricePrecetChosen, {
    //   amount: value,
    //   marketAddress: market?.slug,
    //   marketType: market?.marketType,
    //   marketTags: market?.tags,
    //   marketMakerType: 'CLOB',
    //   assetType: strategy === 'Buy' ? 'money' : 'contracts',
    // })
    if (value == 100) {
      setSharesToConvert(maxShares)
      return
    }
    const amountByPercent = new BigNumber(maxShares).multipliedBy(value).dividedBy(100).toString()
    setSharesToConvert(amountByPercent)
  }

  const handleInputValueChange = (value: string) => {
    if (market?.collateralToken.symbol === 'USDC') {
      const decimals = value.split('.')[1]
      if (decimals && decimals.length > 2) {
        return
      }
      setSharesToConvert(value)
      return
    }
    setSharesToConvert(value)
    return
  }

  const positionsAreNotSelected = positions.every((pos) => !pos.selected)

  const isInputInvalid = new BigNumber(sharesToConvert).isGreaterThan(maxShares)

  const showErrors = useMemo(() => {
    if (!positionsAreNotSelected && !+sharesToConvert) {
      return 'Enter amount'
    }
    if (positionsAreNotSelected && +sharesToConvert) {
      return 'Select markets to convert'
    }
    if (positionsAreNotSelected && !+sharesToConvert) {
      return 'Enter amount, select markets'
    }
    return ''
  }, [positionsAreNotSelected, sharesToConvert])

  return (
    <Box>
      <Text {...paragraphRegular} mt='8px'>
        Turn your “No” shares into the opposite “Yes” shares (or USDC). Just pick the outcomes you
        want to convert and enter the amount—no extra funds needed.{' '}
        <NextLink
          href='https://limitlesslabs.notion.site/#1de04e33c4b980a3bdb6c0139de19398'
          target='_blank'
          rel='noopener'
          passHref
        >
          <Link variant='textLinkSecondary' {...paragraphRegular} isExternal>
            Learn more.
          </Link>
        </NextLink>
      </Text>
      <Flex justifyContent='space-between' alignItems='center' mt='24px'>
        <Text {...paragraphMedium} color={'var(--chakra-colors-text-100)'}>
          Enter amount
        </Text>
        <Flex gap='12px'>
          {[10, 25, 50, 100].map((title: number) => (
            <Button
              {...paragraphRegular}
              p='0'
              borderRadius='0'
              minW='unset'
              h='auto'
              variant='plain'
              key={title}
              flex={1}
              onClick={() => handlePercentButtonClicked(title)}
              color='grey.500'
              borderBottom='1px dotted'
              borderColor='rgba(132, 132, 132, 0.5)'
              _hover={{
                borderColor: 'var(--chakra-colors-text-100)',
                color: 'var(--chakra-colors-text-100)',
              }}
            >
              {renderButtonContent(title)}
            </Button>
          ))}
        </Flex>
      </Flex>
      <Spacer mt='8px' />
      <NumberInputWithButtons
        id='sharesAmountToConvert'
        placeholder='Eg. 5'
        max={maxShares}
        step={1}
        value={sharesToConvert}
        handleInputChange={handleInputValueChange}
        showIncrements={false}
        inputType='number'
        isInvalid={isInputInvalid}
      />
      <VStack w='full' gap='8px' mt='24px' maxH={isMobile ? '50vh' : '290px'} overflowY='auto'>
        {positions.map((position) => (
          <ConvertPosition
            position={position}
            positions={positions}
            setPositions={setConvertPositions}
            key={position.market.slug}
          />
        ))}
      </VStack>
      <HStack gap='8px' mt='32px'>
        <Button
          variant='contained'
          disabled={positionsAreNotSelected || !+sharesToConvert || isInputInvalid}
          onClick={onReviewClick}
        >
          Review
        </Button>
        <Text {...paragraphRegular} color='grey.500'>
          {showErrors}
        </Text>
      </HStack>
    </Box>
  )
}
