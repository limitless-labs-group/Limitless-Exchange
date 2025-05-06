import { Box, Button, Menu, MenuButton, MenuList, Text, useDisclosure } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useEffect, useRef } from 'react'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { ChangeEvent, useAmplitude, useTradingService } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { MarketOrderType } from '@/types'

export default function OrderTypeSelectMenu() {
  const { trackChanged } = useAmplitude()
  const { clobOutcome: outcome } = useTradingService()
  const {
    orderType,
    setOrderType,
    yesPrice,
    noPrice,
    setSharesAmount,
    setPrice,
    price,
    sharesAmount,
  } = useClobWidget()
  const {
    isOpen: orderTypeMenuOpen,
    onOpen: onOpenOrderTypeMenu,
    onClose: onCloseOrderTypeMenu,
  } = useDisclosure()

  const menuRef = useRef<HTMLDivElement>(null)

  // Add useEffect for handling mouse events
  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement
      if (menuRef.current && !menuRef.current.contains(relatedTarget)) {
        onCloseOrderTypeMenu()
      }
    }

    const menuElement = menuRef.current
    if (menuElement) {
      menuElement.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (menuElement) {
        menuElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [onCloseOrderTypeMenu])

  const handleOrderTypeChanged = (order: MarketOrderType) => {
    setOrderType(order)
    if (order === MarketOrderType.MARKET) {
      setPrice(sharesAmount)
      setSharesAmount('')
    } else {
      const selectedPrice = new BigNumber(100)
        .minus(outcome ? yesPrice : noPrice)
        .decimalPlaces(1)
        .toNumber()
      setPrice(selectedPrice === 0 ? '' : String(selectedPrice))
      setSharesAmount(price)
    }
    trackChanged(ChangeEvent.ClobWidgetModeChanged, {
      mode: order === MarketOrderType.MARKET ? 'amm on' : 'clob on',
    })
    onCloseOrderTypeMenu()
  }
  return (
    <Menu isOpen={orderTypeMenuOpen} onClose={onCloseOrderTypeMenu} variant='transparent'>
      <Box ref={menuRef}>
        <MenuButton
          as={Button}
          onMouseEnter={onOpenOrderTypeMenu}
          // onMouseLeave={onCloseOrderTypeMenu}
          onClick={() =>
            handleOrderTypeChanged(
              orderType === MarketOrderType.MARKET ? MarketOrderType.LIMIT : MarketOrderType.MARKET
            )
          }
          rightIcon={<ChevronDownIcon width='16px' height='16px' />}
          h='24px'
          px='8px'
          w='fit'
          _active={{
            bg: 'grey.100',
          }}
          _hover={{
            bg: 'grey.100',
          }}
          gap={0}
        >
          <Text
            {...paragraphMedium}
            className={'amp-mask'}
            whiteSpace='nowrap'
            overflow='hidden'
            textOverflow='ellipsis'
            maxW='112px'
          >
            {orderType === MarketOrderType.MARKET ? 'Market' : 'Limit'}
          </Text>
        </MenuButton>

        <MenuList
          borderRadius='8px'
          w='180px'
          zIndex={2}
          boxShadow='0px 1px 4px 0px rgba(2, 6, 23, 0.05)'
          border='1px solid'
          borderColor='grey.200'
          onMouseEnter={onOpenOrderTypeMenu}
          onMouseLeave={onCloseOrderTypeMenu}
          p='8px !important'
        >
          <Button
            variant='transparent'
            w='full'
            onClick={() => handleOrderTypeChanged(MarketOrderType.MARKET)}
            justifyContent='flex-start'
          >
            Market
          </Button>
          <Button
            variant='transparent'
            w='full'
            justifyContent='flex-start'
            onClick={() => handleOrderTypeChanged(MarketOrderType.LIMIT)}
          >
            Limit
          </Button>
        </MenuList>
      </Box>
    </Menu>
  )
}
