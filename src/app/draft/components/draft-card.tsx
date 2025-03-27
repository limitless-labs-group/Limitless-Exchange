import { Box, HStack, Link, Text, Image as ChakraImage, Checkbox, Stack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import TextEditor from '@/components/common/text-editor'
import CategoryIcon from '@/resources/icons/category.svg'
import FeeIcon from '@/resources/icons/fee.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import DeadlineIcon from '@/resources/icons/sun-watch.svg'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { DraftMarket, MarketInput } from '@/types/draft'
import { NumberUtil } from '@/utils'

interface DraftMarketSingleCardProps {
  market: DraftMarket | Market
  isChecked?: boolean
  onToggle?: () => void
  onClick?: () => void
}

function isDraftMarket(market: DraftMarket | Market): market is DraftMarket {
  return 'draftMetadata' in market
}

function isMarket(market: DraftMarket | Market): market is Market {
  return 'tradeType' in market
}

const colors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}
const badgeBg = {
  amm: 'blue.100',
  clob: 'green.100',
  group: 'lime.100',
}

const MarketDataFactory = {
  getMarketType: (market: DraftMarket | Market): string => {
    if (isDraftMarket(market)) {
      return market.type
    }
    if (isMarket(market)) {
      return market.tradeType
    }
    return ''
  },

  getTypeColor: (market: DraftMarket | Market): string => {
    const type = MarketDataFactory.getMarketType(market)
    return type === 'amm' ? 'blue.100' : 'green.200'
  },

  getCategoryNames: (market: DraftMarket | Market): string => {
    return (
      market.categories.map((cat) => (typeof cat === 'string' ? cat : cat.name)).join(', ') ||
      'Other'
    )
  },

  isZeroOrEmpty: (value: string | number | undefined | null): boolean => {
    if (value === undefined || value === null || value === '') return true
    if (typeof value === 'string') {
      const numValue = parseFloat(value)
      return isNaN(numValue) || numValue === 0
    }
    return value === 0
  },

  formatDeadline: (market: DraftMarket | Market): string => {
    if (isMarket(market) && market.expirationTimestamp) {
      return (
        new Date(market.expirationTimestamp).toLocaleString('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }) + ' ET'
      )
    }

    return market.deadline
      ? new Date(market.deadline).toLocaleString('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }) + ' ET'
      : 'Invalid date'
  },

  renderCreatorAndTags: (market: DraftMarket | Market) => {
    return isMarket(market) ? (
      <HStack gap='8px' flexWrap='wrap'>
        <ChakraImage
          width={6}
          height={6}
          src={market?.creator.imageUrl ?? '/assets/images/logo.svg'}
          alt='creator'
          borderRadius={'2px'}
        />
        <Link href={market?.creator.link || ''} isExternal>
          <Text color='grey.500'>{market?.creator.name}</Text>
        </Link>
        {market?.tags?.map((tag: any) => (
          <Text color='grey.500' key={tag.id}>
            #{tag.name}
          </Text>
        ))}
      </HStack>
    ) : (
      <HStack gap='8px' flexWrap='wrap'>
        <ChakraImage
          width={6}
          height={6}
          src={market?.creator.name ?? '/assets/images/logo.svg'}
          alt='creator'
          borderRadius={'2px'}
        />
        <Text color='grey.500'>{market?.creator.name ?? ''}</Text>
        {market?.tags?.map((tag: any) => (
          <Text color='grey.500' key={tag.id}>
            #{tag.name}
          </Text>
        ))}
      </HStack>
    )
  },

  renderGroupMarkets: (market: DraftMarket | Market) => {
    if (isMarket(market)) return
    if (market.type === 'group' && market?.markets && market.markets?.length > 0) {
      return (
        <Box pl={2} mb={2}>
          <Text {...paragraphMedium} color={colors.secondary} mb={1}>
            Markets in group:
          </Text>
          <Stack spacing={1}>
            {[...market.markets]
              .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
              .map((subMarket: MarketInput, index: number) => (
                <Text
                  key={market.id ?? index}
                  {...paragraphRegular}
                  color={colors.main}
                  pl={4}
                  position='relative'
                  _before={{
                    content: '"•"',
                    position: 'absolute',
                    left: 1,
                    color: colors.secondary,
                  }}
                >
                  {subMarket.title}
                </Text>
              ))}
          </Stack>
        </Box>
      )
    }
    return null
  },
}

const DraftMarketSpecificInfo = ({ market }: { market: DraftMarket }) => (
  <>
    {market.draftMetadata?.liquidity
      ? !MarketDataFactory.isZeroOrEmpty(market.draftMetadata.liquidity) && (
          <HStack w={'unset'} justifyContent={'unset'}>
            <HStack color={colors.secondary} gap='4px'>
              <LiquidityIcon width={16} height={16} />
              <Text {...paragraphMedium} color={colors.secondary}>
                Liq.
              </Text>
            </HStack>
            <Text {...paragraphRegular} color={colors.main}>
              {NumberUtil.formatThousands(market.draftMetadata.liquidity, 6) +
                ' ' +
                market.collateralToken.symbol}
            </Text>
          </HStack>
        )
      : null}

    <HStack w={'unset'} justifyContent={'unset'}>
      <HStack color={colors.secondary} gap='4px'>
        <FeeIcon width={16} height={16} />
        <Text {...paragraphMedium} color={colors.secondary}>
          Fee
        </Text>
      </HStack>
      <Text {...paragraphRegular} color={colors.main}>
        {market.draftMetadata.fee}%
      </Text>
    </HStack>

    <HStack gap={1} color={colors.main}>
      {market.draftMetadata.initialProbability && (
        <>
          <Text {...paragraphMedium} color={colors.secondary}>
            Prob.
          </Text>
          <Text {...paragraphMedium} color={colors.main}>
            {market.draftMetadata.initialProbability * 100}%
          </Text>
        </>
      )}
      <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
        <Box
          h='100%'
          w='100%'
          borderRadius='100%'
          bg={`conic-gradient(${colors.main} ${
            market.draftMetadata.initialProbability * 100
          }% 10%, ${colors.chartBg} ${market.draftMetadata.initialProbability * 100}% 100%)`}
        />
      </Box>
    </HStack>
  </>
)

const MarketSpecificInfo = ({ market }: { market: Market }) => (
  <>
    {market.liquidityFormatted && !MarketDataFactory.isZeroOrEmpty(market.liquidityFormatted) ? (
      <HStack w={'unset'} justifyContent={'unset'}>
        <HStack color={colors.secondary} gap='4px'>
          <LiquidityIcon width={16} height={16} />
          <Text {...paragraphMedium} color={colors.secondary}>
            Liq.
          </Text>
        </HStack>
        <Text {...paragraphRegular} color={colors.main}>
          {NumberUtil.formatThousands(market.liquidityFormatted, 6)}
        </Text>
      </HStack>
    ) : null}

    {market.volumeFormatted && !MarketDataFactory.isZeroOrEmpty(market.volumeFormatted) ? (
      <HStack w={'unset'} justifyContent={'unset'}>
        <HStack color={colors.secondary} gap='4px'>
          <FeeIcon width={16} height={16} />
          <Text {...paragraphMedium} color={colors.secondary}>
            Vol.
          </Text>
        </HStack>
        <Text {...paragraphRegular} color={colors.main}>
          {NumberUtil.formatThousands(market.volumeFormatted, 6)}
        </Text>
      </HStack>
    ) : null}

    {market.prices && market.prices.length > 0 && (
      <HStack gap={1} color={colors.main}>
        <Text {...paragraphMedium} color={colors.secondary}>
          Prob.
        </Text>
        <Text {...paragraphMedium} color={colors.main}>
          {market.prices[0].toFixed(2)}%
        </Text>
        <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
          <Box
            h='100%'
            w='100%'
            borderRadius='100%'
            bg={`conic-gradient(${colors.main} ${market.prices[0]}% 10%, ${colors.chartBg} ${market.prices[0]}% 100%)`}
          />
        </Box>
      </HStack>
    )}
  </>
)

export const DraftMarketCard = ({
  market,
  isChecked,
  onToggle,
  onClick,
}: DraftMarketSingleCardProps) => {
  const [hover, setHover] = useState(false)

  const marketType = MarketDataFactory.getMarketType(market)
  const typeColor = MarketDataFactory.getTypeColor(market)
  const categoryNames = MarketDataFactory.getCategoryNames(market)
  const formattedDeadline = MarketDataFactory.formatDeadline(market)

  return (
    <Paper
      w={'full'}
      id={String(market.id)}
      scrollMarginTop='50px'
      justifyContent={'space-between'}
      _hover={{ ...(!isMobile ? { bg: 'var(--chakra-colors-grey-200)' } : {}) }}
      border={`3px solid ${isChecked ? 'var(--chakra-colors-draftCard-border)' : 'transparent'}`}
      bg={` ${isChecked ? 'var(--chakra-colors-draftCard-bg)' : 'var(--chakra-colors-grey-100)'}`}
      position='relative'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <HStack align='start' spacing={4}>
        <Checkbox
          isChecked={isChecked}
          onChange={(e) => {
            e.stopPropagation()
            if (onToggle) {
              onToggle()
            }
          }}
          onClick={(e) => e.stopPropagation()}
          transform='scale(1.5)'
          marginRight='8px'
          marginTop='4px'
        />
        <Box as='a' width='95%'>
          <Stack gap='5px' width='100%'>
            <HStack justifyContent='space-between' mb='5px' alignItems='flex-start'>
              <Text {...paragraphMedium} color={colors.main}>
                {market.title}
              </Text>
              {onClick ? (
                <HStack
                  gap={1}
                  color={colors.main}
                  onClick={onClick}
                  cursor='pointer'
                  _hover={{ textDecoration: 'underline' }}
                >
                  <Text {...paragraphMedium} color={colors.main}>
                    Edit
                  </Text>
                </HStack>
              ) : (
                <HStack gap={1}>
                  <Box px='2' py='1' borderRadius='md' bg={typeColor}>
                    <Text {...paragraphMedium} textTransform='uppercase' fontSize='xs'>
                      {marketType}
                    </Text>
                  </Box>
                </HStack>
              )}
            </HStack>

            {market.description ? (
              <HStack alignItems='flex-start'>
                <Text {...paragraphMedium} color={colors.main} overflow='hidden'>
                  <TextEditor
                    value={market?.description ?? ''}
                    readOnly
                    className={`draft ${hover ? 'hover' : ''} ${isChecked ? 'checked' : ''}`}
                  />
                </Text>
              </HStack>
            ) : null}

            {MarketDataFactory.renderGroupMarkets(market)}

            {MarketDataFactory.renderCreatorAndTags(market)}
            <HStack justifyContent='space-between' alignItems='flex-end' flexDirection={'row'}>
              <HStack gap={'16px'} flexDirection={'row'} w='full'>
                <HStack w={'unset'} justifyContent={'unset'}>
                  <HStack color={colors.secondary} gap='4px'>
                    <DeadlineIcon width={16} height={16} />
                    <Text {...paragraphMedium} color={colors.secondary}>
                      Deadline
                    </Text>
                  </HStack>
                  <Text {...paragraphRegular} color={colors.main}>
                    {formattedDeadline}
                  </Text>
                </HStack>

                <HStack w={'unset'} justifyContent={'unset'}>
                  <HStack color={colors.secondary} gap='4px'>
                    <CategoryIcon width={16} height={16} />
                    <Text {...paragraphMedium} color={colors.secondary}>
                      Cat.
                    </Text>
                  </HStack>
                  <Text
                    {...paragraphRegular}
                    color={colors.main}
                    maxW='200px'
                    overflow='hidden'
                    textOverflow='ellipsis'
                    whiteSpace='nowrap'
                  >
                    {categoryNames}
                  </Text>
                </HStack>
                {isDraftMarket(market) && <DraftMarketSpecificInfo market={market} />}
                {isMarket(market) && <MarketSpecificInfo market={market} />}
              </HStack>
            </HStack>
          </Stack>
        </Box>
      </HStack>
    </Paper>
  )
}
