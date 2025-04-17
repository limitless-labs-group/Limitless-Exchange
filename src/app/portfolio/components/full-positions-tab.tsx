import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Text } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { formatUnits, parseUnits } from 'viem'
import { ClobContractsInMarket } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface FullPositionsTabProps {
  position: ClobContractsInMarket
  contracts: { yes: string; no: string }
  decimals: number
  symbol: string
  marketClosed: boolean
  winSide: number | null
}

export default function FullPositionsTab({
  position,
  contracts,
  decimals,
  symbol,
  marketClosed,
  winSide,
}: FullPositionsTabProps) {
  const getContractsAmount = (size: string) => {
    const formattedAmount = formatUnits(BigInt(size), decimals)
    return NumberUtil.convertWithDenomination(formattedAmount, 2)
  }

  const normalizePrice = (number: string) => {
    const price = formatUnits(BigInt(number), decimals)
    const formattedPrice = new BigNumber(price).multipliedBy(100).toString()
    return NumberUtil.toFixed(formattedPrice, 1)
  }

  const normalizeCost = (size: string) => {
    const formattedCost = formatUnits(BigInt(size), decimals)
    return NumberUtil.convertWithDenomination(formattedCost, 2)
  }

  const showPosition = (size: string) => {
    return parseUnits('0.01', decimals) <= BigInt(size)
  }

  const isEmptyPosition = !+contracts.yes && !+contracts.no

  return (
    <Box>
      {isEmptyPosition ? (
        <Text {...paragraphMedium}>No positions.</Text>
      ) : (
        <TableContainer overflow={'auto'} w='fit-content'>
          <Table variant={'noPaddingsOnSides'}>
            <Thead>
              <Tr>
                <Th
                  minW='80px'
                  color={marketClosed ? 'whiteAlpha.70 !important' : 'grey.500'}
                  borderColor={marketClosed ? 'whiteAlpha.20 !important' : 'grey.200'}
                >
                  Position
                </Th>
                <Th
                  minW='80px'
                  color={marketClosed ? 'whiteAlpha.70 !important' : 'grey.500'}
                  borderColor={marketClosed ? 'whiteAlpha.20 !important' : 'grey.200'}
                >
                  Contracts
                </Th>
                <Th
                  isNumeric
                  minW='120px'
                  color={marketClosed ? 'whiteAlpha.70 !important' : 'grey.500'}
                  borderColor={marketClosed ? 'whiteAlpha.20 !important' : 'grey.200'}
                >
                  AVG. Fill price
                </Th>
                <Th
                  minW='120px'
                  color={marketClosed ? 'whiteAlpha.70 !important' : 'grey.500'}
                  borderColor={marketClosed ? 'whiteAlpha.20 !important' : 'grey.200'}
                >
                  Cost
                </Th>
                <Th
                  minW='152px'
                  color={marketClosed ? 'whiteAlpha.70 !important' : 'grey.500'}
                  borderColor={marketClosed ? 'whiteAlpha.20 !important' : 'grey.200'}
                >
                  Market Value
                </Th>
                <Th
                  w='120px'
                  // @ts-ignore
                  textAlign='start !important'
                  color={marketClosed ? 'whiteAlpha.70 !important' : 'grey.500'}
                  borderColor={marketClosed ? 'whiteAlpha.20 !important' : 'grey.200'}
                >
                  {marketClosed ? 'Won' : 'To Win'}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {showPosition(contracts.yes) && (
                <Tr>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>Yes</Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {getContractsAmount(contracts.yes)}
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {normalizePrice(position.yes.fillPrice)}¢
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {normalizeCost(position.yes.cost)} {symbol}
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {!winSide || winSide === 0 ? normalizeCost(position.yes.marketValue) : '0.00'}{' '}
                    {symbol}
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {!winSide || winSide === 0 ? getContractsAmount(contracts.yes) : '0.00'}{' '}
                    {symbol}
                  </Td>
                </Tr>
              )}
              {showPosition(contracts.no) && (
                <Tr>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>No</Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {getContractsAmount(contracts.no)}
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {normalizePrice(position.no.fillPrice)}¢
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {normalizeCost(position.no.cost)} {symbol}
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {winSide === null || winSide === 1
                      ? normalizeCost(position.no.marketValue)
                      : '0.00'}{' '}
                    {symbol}
                  </Td>
                  <Td color={marketClosed ? 'white !important' : 'grey.500'}>
                    {winSide === null || winSide === 1 ? getContractsAmount(contracts.no) : '0.00'}{' '}
                    {symbol}
                  </Td>
                </Tr>
              )}
            </Tbody>
            {/*<Tbody>{children}</Tbody>*/}
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
