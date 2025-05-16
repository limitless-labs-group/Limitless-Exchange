import { Box, Flex, FormControl, Text, FormLabel, Input, Button, Center } from '@chakra-ui/react'
import { htmlToText } from 'html-to-text'
import { useAtom } from 'jotai'
import debounce from 'lodash/debounce'
import { useCallback, useState, useMemo, useEffect } from 'react'
import TextEditor from '@/components/common/text-editor'
import { AdjustableNumberInput } from './number-inputs'
import { dailyToEpochRewards, epochToDailyRewards } from './use-create-market'
import { defaultGroupMarkets, groupMarketsAtom } from '@/atoms/draft'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

export const GroupForm = () => {
  const [markets, setMarkets] = useAtom(groupMarketsAtom)

  const [localInputs, setLocalInputs] = useState<Record<string, string | number>>({})

  const debouncedUpdateMarkets = useMemo(
    () =>
      debounce((updatedMarkets: any[]) => {
        setMarkets(updatedMarkets)
      }, 300),
    [setMarkets]
  )

  useEffect(() => {
    return () => {
      debouncedUpdateMarkets.cancel()
    }
  }, [debouncedUpdateMarkets])

  const handleInputChange = useCallback(
    (index: number, field: string, value: string | number) => {
      const inputKey = `${index}-${field}`
      setLocalInputs((prev) => ({
        ...prev,
        [inputKey]: value,
      }))

      const updatedMarkets = [...markets]

      if (['c', 'maxSpread', 'minSize', 'maxDailyReward'].includes(field)) {
        if (field === 'maxDailyReward') {
          updatedMarkets[index] = {
            ...updatedMarkets[index],
            settings: {
              ...updatedMarkets[index].settings,
              rewardsEpoch: value ? dailyToEpochRewards(Number(value)) : 0,
            },
          }
        } else {
          updatedMarkets[index] = {
            ...updatedMarkets[index],
            settings: {
              ...updatedMarkets[index].settings,
              [field]: value,
            },
          }
        }
      } else {
        updatedMarkets[index] = {
          ...updatedMarkets[index],
          [field]: value,
        }
      }

      debouncedUpdateMarkets(updatedMarkets)
    },
    [markets, debouncedUpdateMarkets]
  )

  const getCurrentValue = useCallback(
    (index: number, field: string, defaultValue: any) => {
      const inputKey = `${index}-${field}`
      return localInputs[inputKey] !== undefined ? localInputs[inputKey] : defaultValue
    },
    [localInputs]
  )

  const getPlainTextLength = (html: string | undefined): number => {
    if (!html) return 0
    return htmlToText(html, {
      wordwrap: false,
      preserveNewlines: true,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
      ],
    }).length
  }

  const addMarket = () => {
    setMarkets([...markets, defaultGroupMarkets[0]])
  }
  return (
    <>
      {markets.map((market, index) => (
        <Box
          key={market.id}
          borderWidth={1}
          p={4}
          borderRadius='md'
          width='100%'
          borderColor='grey.200'
          bg='grey.100'
        >
          <FormControl>
            <FormLabel htmlFor={`market${index}_title`}>
              <Flex justify='space-between' align='center' mb={2}>
                <Text>
                  #{index + 1} title {market.id ? `- id: ${market.id}` : ''}
                </Text>
                {markets.length > 2 ? (
                  <Box
                    cursor='pointer'
                    onClick={() => {
                      const updatedMarkets = [...markets]
                      updatedMarkets.splice(index, 1)
                      setMarkets(updatedMarkets)
                    }}
                  >
                    <CloseIcon height={16} width={16} />
                  </Box>
                ) : null}
              </Flex>
            </FormLabel>
            <Input
              type='text'
              id={`market${index}_title`}
              name={`marketsInput[${index}][title]`}
              value={getCurrentValue(index, 'title', market.title)}
              onChange={(e) => {
                if (getPlainTextLength(e.target.value) <= 3000) {
                  handleInputChange(index, 'title', e.target.value)
                }
              }}
              placeholder={`Enter market ${index + 1} title`}
              _placeholder={{ color: 'grey.400' }}
              borderColor='grey.300'
              _hover={{ borderColor: 'grey.300' }}
              _focus={{ borderColor: 'blue.400' }}
              required
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor={`market${index}_description`}>Description</FormLabel>
            <TextEditor
              value={getCurrentValue(index, 'description', market.description)}
              readOnly={false}
              onChange={(value) => {
                if (getPlainTextLength(value) <= 3000) {
                  handleInputChange(index, 'description', value)
                }
              }}
              style={{ wordBreak: 'break-word' }}
            />
          </FormControl>
          <Flex w='full' direction='row' gap={4} flexWrap='wrap' alignItems='center' mt='8px'>
            <Box flex='0 0 auto' w='auto'>
              <AdjustableNumberInput
                label='Min size'
                value={getCurrentValue(index, 'minSize', market.settings?.minSize)}
                onChange={(value) => handleInputChange(index, 'minSize', value)}
                min={0}
                max={1000}
                step={1}
                compact
                width='60px'
              />
            </Box>
            <Box flex='0 0 auto' w='auto'>
              <AdjustableNumberInput
                label='Max spread'
                value={getCurrentValue(index, 'maxSpread', market.settings?.maxSpread)}
                onChange={(value) => handleInputChange(index, 'maxSpread', value)}
                min={0}
                max={99}
                step={0.1}
                compact
                width='60px'
              />
            </Box>
            <Box flex='0 0 auto' w='auto'>
              <AdjustableNumberInput
                label='C'
                value={getCurrentValue(index, 'c', market.settings?.c)}
                onChange={(value) => handleInputChange(index, 'c', value)}
                min={0}
                max={1000}
                step={1}
                compact
                width='60px'
              />
            </Box>
            <Box flex='0 0 auto' w='auto'>
              <AdjustableNumberInput
                label='Rewards'
                value={getCurrentValue(
                  index,
                  'maxDailyReward',
                  epochToDailyRewards(market.settings?.rewardsEpoch ?? 0)
                )}
                onChange={(value) => handleInputChange(index, 'maxDailyReward', value)}
                min={0}
                max={1000}
                step={0.1}
                prefix='US$'
                compact
                width='80px'
              />
            </Box>
          </Flex>
        </Box>
      ))}
      <Center
        p='16px'
        mt='24px'
        border='1px dashed'
        borderColor='grey.200'
        w='full'
        borderRadius='6px'
      >
        <Button onClick={addMarket} variant='ghost'>
          <Text {...paragraphRegular}>+ Add Market</Text>
        </Button>
      </Center>
    </>
  )
}
