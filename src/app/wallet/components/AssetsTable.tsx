import {
  HStack,
  Image,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  Td,
  Button,
  Divider,
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'
import { useBalanceService } from '@/services'
import { NumberUtil } from '@/utils'
import { usePriceOracle } from '@/providers'
import { useIsMobile } from '@/hooks'
import { useUsersMarkets } from '@/services/MarketsService'
import { Address, formatUnits } from 'viem'
import { MarketTokensIds } from '@/types'

type AssetsTableProps = {
  handleOpenTopUpModal: (token: Address) => void
}

export default function AssetsTable({ handleOpenTopUpModal }: AssetsTableProps) {
  const isMobile = useIsMobile()
  const tableHeaders = isMobile
    ? ['Token', 'Available Balance', 'Deposit']
    : ['Token', 'Available Balance', 'Token Price', 'Active Markets', 'Locked', 'Deposit']

  const { balanceOfSmartWallet } = useBalanceService()
  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data: usersMarkets } = useUsersMarkets()

  const getMarketsCount = (ticker: string) => {
    return usersMarkets?.filter((market) => market.market.collateral.symbol === ticker).length || 0
  }

  const getLockedAmountUsd = (symbol: string, amount: number) => {
    return convertTokenAmountToUsd(symbol, amount)
  }

  const calculateLockedAmount = (collateralAddress: string) => {
    const marketsByCollateral = usersMarkets?.filter(
      (market) => market.market.collateral.id === collateralAddress
    )
    if (marketsByCollateral?.length) {
      return marketsByCollateral.reduce(
        (a, b) => a + +formatUnits(BigInt(b.collateralsLocked), 18),
        0
      )
    }
    return 0
  }

  return (
    <>
      {isMobile && <Divider />}
      <TableContainer
        borderColor={'#E7E7EA'}
        borderWidth={isMobile ? 0 : '1px'}
        borderRadius={'12px'}
        px={isMobile ? 0 : '12px'}
        pb={'12px'}
      >
        <Table variant='simple'>
          <TableCaption
            placement='top'
            textAlign='left'
            fontSize={'20px'}
            fontWeight={'normal'}
            color={'black'}
            w={'fit-content'}
            pl={isMobile ? 0 : '12px'}
          >
            All tokens
          </TableCaption>
          <Thead>
            <Tr>
              {tableHeaders.map((header, index) => (
                <Th
                  key={uuidv4()}
                  textTransform={'none'}
                  color={'fontLight'}
                  fontWeight={'normal'}
                  borderBottom={'unset'}
                  textAlign={index ? 'right' : 'left'}
                  w={index ? 'initial' : '136px'}
                  px={isMobile ? 0 : '12px'}
                >
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {balanceOfSmartWallet?.map((balance) => (
              <Tr key={uuidv4()}>
                <Td borderBottom={'unset'} w={'136px'} px={isMobile ? 0 : '12px'}>
                  <HStack>
                    <Image src={balance.image} alt='token' w={'20px'} h={'20px'} rounded={'full'} />
                    <VStack gap={0} alignItems='flex-start'>
                      <Text>{balance.symbol}</Text>
                      <Text fontWeight={'light'} color={'fontLight'}>
                        {balance.name}
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td borderBottom={'unset'} w={'160px'} px={isMobile ? 0 : '12px'}>
                  <VStack gap={0} alignItems='flex-end'>
                    <Text>{NumberUtil.formatThousands(balance.formatted, 4)}</Text>
                    <Text fontWeight={'light'} color={'fontLight'}>
                      $
                      {NumberUtil.formatThousands(
                        convertTokenAmountToUsd(balance.symbol, balance.formatted),
                        2
                      )}
                    </Text>
                  </VStack>
                </Td>
                {!isMobile && (
                  <>
                    <Td
                      borderBottom={'unset'}
                      textAlign='right'
                      verticalAlign='top'
                      w={'100px'}
                      px={'12px'}
                    >
                      <Text>${NumberUtil.formatThousands(balance.price, 4)}</Text>
                    </Td>
                    <Td
                      borderBottom={'unset'}
                      textAlign='right'
                      verticalAlign='top'
                      w={'120px'}
                      px={'12px'}
                    >
                      <Text>{getMarketsCount(balance.symbol)} markets</Text>
                    </Td>
                    <Td borderBottom={'unset'} w={'100px'} px={'12px'}>
                      <VStack gap={0} alignItems='flex-end'>
                        <Text>
                          {NumberUtil.formatThousands(
                            calculateLockedAmount(balance.contractAddress),
                            4
                          )}
                        </Text>
                        <Text fontWeight={'light'} color={'fontLight'}>
                          $
                          {NumberUtil.formatThousands(
                            getLockedAmountUsd(
                              balance.symbol,
                              calculateLockedAmount(balance.contractAddress)
                            ),
                            2
                          )}
                        </Text>
                      </VStack>
                    </Td>
                  </>
                )}
                <Td
                  borderBottom={'unset'}
                  textAlign='right'
                  verticalAlign='top'
                  pr={isMobile ? 0 : '12px'}
                  pl={'12px'}
                >
                  <Button
                    variant='link'
                    color={'brand'}
                    textDecor='underline'
                    fontWeight={'normal'}
                    fontSize={'14px'}
                    onClick={() => handleOpenTopUpModal(balance.contractAddress as Address)}
                  >
                    Deposit
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {isMobile && <Divider />}
    </>
  )
}
