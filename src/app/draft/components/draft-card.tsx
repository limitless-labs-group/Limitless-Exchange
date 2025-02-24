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
import { Category, Creator, DraftMetadata, Token } from '@/types'
import { NumberUtil } from '@/utils'

export type DraftMarket = {
  id: number
  title: string
  description: string
  deadline: string
  tags: any
  collateralToken: Token
  category: Category
  creator: Creator
  type: 'amm' | 'clob'
  draftMetadata: DraftMetadata
}

interface DraftMarketSingleCardProps {
  market: DraftMarket
  isChecked: boolean
  onToggle: () => void
  onClick?: () => void
}

const colors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

export const DraftMarketCard = ({
  market,
  isChecked,
  onToggle,
  onClick,
}: DraftMarketSingleCardProps) => {
  const [hover, setHover] = useState(false)
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
            onToggle()
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
                  <Box
                    px='2'
                    py='1'
                    borderRadius='md'
                    bg={market.type === 'amm' ? 'blue.100' : 'green.200'}
                  >
                    <Text {...paragraphMedium} textTransform='uppercase' fontSize='xs'>
                      {market.type}
                    </Text>
                  </Box>
                </HStack>
              )}
            </HStack>

            <HStack alignItems='flex-start'>
              <Text {...paragraphMedium} color={colors.main} overflow='hidden'>
                <TextEditor
                  value={market?.description ?? ''}
                  readOnly
                  className={`draft ${hover ? 'hover' : ''} ${isChecked ? 'checked' : ''}`}
                />
              </Text>
            </HStack>

            <HStack gap='8px' flexWrap='wrap'>
              <ChakraImage
                width={6}
                height={6}
                src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
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

            <HStack justifyContent='space-between' alignItems='flex-end' flexDirection={'row'}>
              <HStack gap={'16px'} flexDirection={'row'} w='full'>
                {market.draftMetadata.liquidity && (
                  <HStack w={'unset'} justifyContent={'unset'}>
                    <HStack color={colors.secondary} gap='4px'>
                      <LiquidityIcon width={16} height={16} />
                      <Text {...paragraphMedium} color={colors.secondary}>
                        Liquidity
                      </Text>
                    </HStack>
                    <Text {...paragraphRegular} color={colors.main}>
                      {NumberUtil.formatThousands(market.draftMetadata.liquidity, 6) +
                        ' ' +
                        market.collateralToken.symbol}
                    </Text>
                  </HStack>
                )}

                <HStack w={'unset'} justifyContent={'unset'}>
                  <HStack color={colors.secondary} gap='4px'>
                    <DeadlineIcon width={16} height={16} />
                    <Text {...paragraphMedium} color={colors.secondary}>
                      Deadline
                    </Text>
                  </HStack>
                  <Text {...paragraphRegular} color={colors.main}>
                    {market.deadline
                      ? new Date(market.deadline).toLocaleString('en-US', {
                          timeZone: 'America/New_York',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })
                      : 'Invalid date'}
                    {' ' + 'ET'}
                  </Text>
                </HStack>

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
                <HStack w={'unset'} justifyContent={'unset'}>
                  <HStack color={colors.secondary} gap='4px'>
                    <CategoryIcon width={16} height={16} />
                    <Text {...paragraphMedium} color={colors.secondary}>
                      Category
                    </Text>
                  </HStack>
                  <Text {...paragraphRegular} color={colors.main}>
                    {market.category.name}
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
                      }% 10%, ${colors.chartBg} ${
                        market.draftMetadata.initialProbability * 100
                      }% 100%)`}
                    />
                  </Box>
                </HStack>
              </HStack>
            </HStack>
          </Stack>
        </Box>
      </HStack>
    </Paper>
  )
}
