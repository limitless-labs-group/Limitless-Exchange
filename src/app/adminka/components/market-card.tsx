import {
  Box,
  HStack,
  Link,
  Text,
  Image as ChakraImage,
  Checkbox,
  Stack,
  Flex,
  Switch,
} from '@chakra-ui/react'
import { format, toZonedTime } from 'date-fns-tz'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import TextEditor from '@/components/common/text-editor'
import { epochToDailyRewards } from '@/app/draft/components/use-create-market'
import CategoryIcon from '@/resources/icons/category.svg'
import FeeIcon from '@/resources/icons/fee.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import DeadlineIcon from '@/resources/icons/sun-watch.svg'
import {
  captionMedium,
  captionRegular,
  h3Medium,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { DraftMarket, MarketInput } from '@/types/draft'
import { NumberUtil } from '@/utils'

interface DraftMarketSingleCardProps {
  market: DraftMarket | Market
  isChecked?: boolean
  onToggle?: () => void
  onClick?: () => void
}

interface DescArgs {
  market: DraftMarket | Market
  hover?: boolean
  isChecked?: boolean
  isDescShown: boolean
  setIsDescShown: React.Dispatch<React.SetStateAction<boolean>>
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

const MarketDataFactory = {
  getMarketType: (market: DraftMarket | Market): string => {
    if ('type' in market) return market.type
    if (isDraftMarket(market)) {
      return market.type
    }
    if (isMarket(market)) {
      return market.marketType === 'group' ? 'group' : market.tradeType
    }
    return ''
  },

  getTypeColor: (market: DraftMarket | Market): string => {
    const type = MarketDataFactory.getMarketType(market)
    switch (type) {
      case 'clob':
        return 'purple.500'
      case 'group':
        return 'blue.500'
      default:
        return 'green.500'
    }
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
    const dateOptions = {
      timeZone: 'America/New_York',
    }

    if (isMarket(market)) {
      if (!market.expirationTimestamp) return 'Invalid date'

      const date = new Date(market.expirationTimestamp)

      const etDate = format(
        toZonedTime(date, 'America/New_York'),
        'MMM d, yyyy h:mm aa',
        dateOptions
      )

      const utcDate = format(toZonedTime(date, 'UTC'), 'MMM d, yyyy h:mm aa', {
        timeZone: 'UTC',
      })

      return `${etDate} ET / ${utcDate} UTC`
    }

    if (!market.deadline) return 'Invalid date'

    const date = new Date(market.deadline)

    const etDate = format(toZonedTime(date, 'America/New_York'), 'MMM d, yyyy h:mm aa', dateOptions)

    const utcDate = format(toZonedTime(date, 'UTC'), 'MMM d, yyyy h:mm aa', { timeZone: 'UTC' })

    return `${etDate} ET / ${utcDate} UTC`
  },

  renderCreator: (market: DraftMarket | Market) => {
    return isMarket(market) ? (
      <HStack>
        <ChakraImage
          width={6}
          height={6}
          src={market?.creator.imageUrl ?? '/assets/images/logo.svg'}
          alt='creator'
          borderRadius={'99px'}
        />
        {/* <Link href={market?.creator.link || ''} isExternal> */}
        {/*   <Text color='grey.500'>{market?.creator.name}</Text> */}
        {/* </Link> */}
      </HStack>
    ) : (
      <HStack>
        <ChakraImage
          width={6}
          height={6}
          src={market?.creator.pfpUrl ?? '/assets/images/logo.svg'}
          alt='creator'
          borderRadius={'99px'}
        />
        {/* <Text color='grey.500'> */}
        {/*   {market?.creator?.displayName ?? market?.creator.username ?? ''} */}
        {/* </Text> */}
      </HStack>
    )
  },

  renderTags: (market: DraftMarket | Market) => {
    return isMarket(market) ? (
      <HStack gap='8px' flexWrap='wrap'>
        {market?.tags?.map((tag: string, index) => (
          <Text color='grey.500' key={index}>
            #{tag}
          </Text>
        ))}
      </HStack>
    ) : (
      <HStack gap='8px' flexWrap='wrap'>
        {market?.tags?.map((tag: any) => (
          <Text color='grey.500' key={tag.id}>
            #{tag.name}
          </Text>
        ))}
      </HStack>
    )
  },

  renderAttributes: (market: DraftMarket | Market) => {
    return isMarket(market) ? (
      <MarketSpecificInfo market={market} />
    ) : (
      <DraftMarketSpecificInfo market={market} />
    )
  },

  renderDescription: (descArgs: DescArgs) => {
    const { market, isChecked, isDescShown, setIsDescShown, hover } = descArgs
    const type = (market: DraftMarket | Market) => {
      if (isMarket(market)) return market.marketType
      return market.type
    }

    if (type(market) === 'group' && market?.markets && market.markets?.length > 0) {
      return (
        <Box>
          <HStack justifyContent='space-between' mb='16px'>
            <Text {...paragraphMedium} color={colors.secondary} mb={2}>
              Markets in group:
            </Text>
            <Switch isChecked={isDescShown} onChange={() => setIsDescShown(!isDescShown)}>
              Show description
            </Switch>
          </HStack>
          <Stack gap='15px'>
            {[...market.markets]
              .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
              .map((subMarket: MarketInput, index: number) => {
                const { title, description, settings, id } = subMarket
                return (
                  <Stack gap='10px' key='index'>
                    <HStack justifyContent='space-between' alignItems='end'>
                      <Text
                        key={id ?? index}
                        {...paragraphMedium}
                        fontWeight='500'
                        color={colors.main}
                      >
                        {`->`} {title}
                      </Text>
                      <HStack>
                        <Text {...captionRegular}>rewards:</Text>
                        <Text {...captionMedium} fontWeight='700'>
                          {epochToDailyRewards(settings?.rewardsEpoch ?? 0)}
                        </Text>
                      </HStack>
                    </HStack>
                    {isDescShown ? (
                      <Text {...captionRegular} color={colors.secondary} overflow='hidden'>
                        <TextEditor
                          value={description ?? ''}
                          readOnly
                          className={`draft ${hover ? 'hover' : ''} ${isChecked ? 'checked' : ''}`}
                        />
                      </Text>
                    ) : null}
                  </Stack>
                )
              })}
          </Stack>
        </Box>
      )
    }
    return market.description ? (
      <HStack alignItems='flex-start'>
        <Text {...paragraphMedium} color={colors.main} overflow='hidden'>
          <TextEditor
            value={market?.description ?? ''}
            readOnly
            style={{ backgroundColor: 'red' }}
            className={`draft ${hover ? 'hover' : ''} ${isChecked ? 'checked' : ''}`}
          />
        </Text>
      </HStack>
    ) : null
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

    {market.draftMetadata?.initialProbability ? (
      <HStack gap={1} color={colors.main}>
        <>
          <Text {...paragraphMedium} color={colors.secondary}>
            Prob.
          </Text>
          <Text {...paragraphMedium} color={colors.main}>
            {market.draftMetadata.initialProbability * 100}%
          </Text>
        </>

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
    ) : null}
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

export const AdminMarketCard = ({
  market,
  isChecked,
  onToggle,
  onClick,
}: DraftMarketSingleCardProps) => {
  const [hover, setHover] = useState(false)
  const [isDescShown, setIsDescShown] = useState(false)

  const marketType = MarketDataFactory.getMarketType(market)
  const typeColor = MarketDataFactory.getTypeColor(market)
  const categoryNames = MarketDataFactory.getCategoryNames(market)
  const formattedDeadline = MarketDataFactory.formatDeadline(market)

  return (
    <Paper
      p='16px'
      w={'full'}
      minW={!isMobile ? '868px' : 'unset'}
      id={String(market.id)}
      scrollMarginTop='50px'
      justifyContent={'space-between'}
      _hover={{ ...(!isMobile ? { bg: 'var(--chakra-colors-grey-200)' } : {}) }}
      border={`3px solid ${
        isChecked || hover ? 'var(--chakra-colors-grey-500)' : 'var(--chakra-colors-grey-200)'
      }`}
      bg={` ${
        isChecked ? 'var(--chakra-colors-grey-200)' : 'var(--chakra-colors-draftCard-background)'
      }`}
      position='relative'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover || isChecked ? (
        <Flex
          position='absolute'
          bg={'var(--chakra-colors-draftCard-background)'}
          top='-10px'
          left='-10px'
          w='24px'
          h='24px'
          borderRadius='2px'
          alignItems='center'
          justifyContent='center'
        >
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
          />
        </Flex>
      ) : null}

      <HStack align='start' spacing={4}>
        <Box as='a' w='full'>
          <Stack gap='16px' width='100%'>
            <HStack justifyContent='space-between'>
              <HStack>
                {MarketDataFactory.renderCreator(market)}

                <HStack gap={1}>
                  <Box px='2' py='1' borderRadius='md' bg={typeColor}>
                    <Text
                      {...paragraphMedium}
                      color='white'
                      textTransform='uppercase'
                      fontSize='xs'
                    >
                      {marketType}
                    </Text>
                  </Box>
                </HStack>

                <HStack w={'unset'}>
                  <HStack color={colors.secondary} gap='4px'>
                    <DeadlineIcon width={14} height={14} />
                    <Text {...paragraphMedium} color={colors.secondary}>
                      DL
                    </Text>
                  </HStack>
                  <Text {...captionMedium} color={colors.main}>
                    {formattedDeadline}
                  </Text>
                </HStack>
                {MarketDataFactory.renderTags(market)}
              </HStack>

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
              ) : null}
            </HStack>
            <HStack justifyContent='space-between' mb='5px' alignItems='flex-start'>
              <Text {...h3Medium} color={colors.main}>
                {market.title}
              </Text>
            </HStack>

            <HStack justifyContent='space-between' alignItems='flex-end' flexDirection={'row'}>
              <HStack gap={'16px'} flexDirection={'row'} w='full'>
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
                {market.settings ? (
                  <HStack w={'unset'} justifyContent={'unset'}>
                    <HStack color={colors.secondary} gap='4px'>
                      <FeeIcon width={16} height={16} />
                      <Text {...paragraphMedium} color={colors.secondary}>
                        Rewards
                      </Text>
                    </HStack>
                    <Text {...paragraphRegular} color={colors.main}>
                      {market.settings?.rewardsEpoch
                        ? epochToDailyRewards(market.settings.rewardsEpoch)
                        : 'NA'}
                    </Text>
                  </HStack>
                ) : null}

                {MarketDataFactory.renderAttributes(market)}
              </HStack>
            </HStack>

            {MarketDataFactory.renderDescription({
              market,
              isChecked,
              hover,
              isDescShown,
              setIsDescShown,
            })}
          </Stack>
        </Box>
      </HStack>
    </Paper>
  )
}
