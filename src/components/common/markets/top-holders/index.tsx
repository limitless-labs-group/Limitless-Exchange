import {
  HStack,
  Select,
  Text,
  Stack,
  Box,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Button,
  ButtonGroup,
  Spinner,
  Center,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import { HOLDERS_LIMIT, HolderUserData, useTopHoldersPaginated } from '@/hooks/use-top-holders'
import { useTradingService } from '@/services'
import { h2Medium, headline, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { LeaderIcon } from '../../leaders-icon'
import TablePagination from '../../table-pagination'

export enum HOLDERS {
  YES = 'Yes Holders',
  NO = 'No Holders',
}

const getUserDisplayName = (data: HolderUserData) => {
  return (
    data.username ?? `${data.user.substring(0, 6)}...${data.user.substring(data.user.length - 4)}`
  )
}

export const TopHoldersTab = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeHolders, setActiveHolders] = useState(HOLDERS.YES)
  const { market, groupMarket } = useTradingService()
  const isGroup = market?.marketType === 'group'
  const [selectedMarket, setSelectedMarket] = useState(groupMarket?.markets?.[0]?.slug)

  const { data, isLoading, error } = useTopHoldersPaginated(
    selectedMarket ?? market?.slug,
    currentPage
  )

  const holdersData = useMemo(() => {
    if (!data?.holders) return { data: [], total: 0 }
    const holderKey = activeHolders === HOLDERS.YES ? 'yes' : 'no'
    return data.holders[holderKey] ?? { data: [], total: 0 }
  }, [data, activeHolders])

  const totalPages = data?.totalPages ?? 1

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const holdersOption = [HOLDERS.YES, HOLDERS.NO]

  return (
    <Stack>
      <HStack justifyContent='space-between' my='16px'>
        <ButtonGroup variant='outline' gap='2px' p='2px' bg='grey.100' borderRadius='8px'>
          {holdersOption.map((option) => (
            <Button
              key={option}
              variant='grey'
              bg={option === activeHolders ? 'grey.50' : 'grey.100'}
              onClick={() => {
                setActiveHolders(option)
              }}
              _hover={{ bg: option === activeHolders ? 'grey.50' : 'grey.200' }}
              borderRadius='8px'
              h={isMobile ? '28px' : '20px'}
              whiteSpace='nowrap'
              {...paragraphMedium}
              color={'grey.800'}
              p={'2px 12px 2px 12px'}
              marginInlineStart='0px !important'
              position={isMobile ? 'unset' : 'relative'}
            >
              {option}
            </Button>
          ))}
        </ButtonGroup>

        {isGroup ? (
          <Select
            h={isMobile ? '32px' : '24px'}
            w='full'
            maxW='200px'
            borderColor='grey.200'
            bg='grey.100'
            _focus={{ borderColor: 'grey.200' }}
            value={selectedMarket}
            onChange={(e) => {
              setSelectedMarket(e.target.value)
            }}
            textOverflow='ellipsis'
            overflow='hidden'
            whiteSpace='nowrap'
            css={{
              '& option': {
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              },
            }}
          >
            {groupMarket?.markets?.map((market: Market) => (
              <option key={market.id} value={market.slug} title={market.title ?? ''}>
                {market.title ?? ''}
              </option>
            ))}
          </Select>
        ) : null}
      </HStack>
      <Text {...headline}>{activeHolders}</Text>

      <Box mb={isMobile ? '40px' : 0}>
        {isLoading ? (
          <Center mt='24px'>
            <Spinner size='md' mr={2} />
            <Text {...h2Medium}>Loading holders data...</Text>
          </Center>
        ) : null}
        {error ? (
          <Box mt='24px'>
            <Text {...h2Medium}>Error loading holders data. Please try again.</Text>
          </Box>
        ) : null}
        {!holdersData?.data?.length ? (
          <Box mt='24px'>
            <Text {...h2Medium}>No data available for this market.</Text>
          </Box>
        ) : (
          <>
            <TableContainer overflow={'auto'} mb='8px' px={isMobile ? '16px' : 0}>
              <Table variant={'simple'}>
                <Thead>
                  <Tr>
                    <Th w='28px'></Th>
                    <Th w='220px'>Username</Th>
                    <Th w='120px'>Contracts</Th>
                    <Th w='120px' textAlign='right'>
                      Market value
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {holdersData.data.map((holder, index) => (
                    <Tr key={`${holder.user}-${index}`}>
                      <Td h='44px'>
                        {currentPage === 1 && index < 3 ? (
                          <LeaderIcon index={index} />
                        ) : (
                          `${(currentPage - 1) * HOLDERS_LIMIT + (index + 1)}`
                        )}
                      </Td>
                      <Td>
                        <HStack gap='4px'>
                          <Avatar account={holder.user} avatarUrl={''} />
                          <NextLink
                            href={`https://basescan.org/address/${holder.user}`}
                            target='_blank'
                            rel='noopener'
                            passHref
                          >
                            <Link variant='textLinkSecondary' {...paragraphRegular} isExternal>
                              {getUserDisplayName(holder)}
                            </Link>
                          </NextLink>
                        </HStack>
                      </Td>
                      <Td>{holder.contracts}</Td>
                      <Td textAlign='right'>
                        {`${Number(holder.valueUSDC).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })} USDC`}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <TablePagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </Box>
    </Stack>
  )
}
