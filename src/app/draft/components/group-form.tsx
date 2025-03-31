import {
  Box,
  Flex,
  FormControl,
  Text,
  FormHelperText,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react'
import { htmlToText } from 'html-to-text'
import { useAtom } from 'jotai'
import TextEditor from '@/components/common/text-editor'
import { groupMarketsAtom } from '@/atoms/draft'
import CloseIcon from '@/resources/icons/close-icon.svg'

export const GroupForm = () => {
  const [markets, setMarkets] = useAtom(groupMarketsAtom)

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedMarkets = [...markets]
    updatedMarkets[index] = {
      ...updatedMarkets[index],
      [field]: value,
    }
    setMarkets(updatedMarkets)
  }
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
    setMarkets([...markets, { title: '', description: '' }])
  }
  return (
    <>
      {markets.map((market, index) => (
        <Box key={market.id} borderWidth={1} p={4} borderRadius='md' width='100%'>
          <Flex justify='space-between' align='center' mb={2}>
            <Text fontWeight='bold'>
              Market #{index + 1} {market.id ? `- id: ${market.id}` : ''}
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
                <CloseIcon color='red' height={24} width={24} />
              </Box>
            ) : null}
          </Flex>
          <FormControl>
            <FormLabel htmlFor={`market${index}_title`}>Title</FormLabel>
            <Input
              type='text'
              id={`market${index}_title`}
              name={`marketsInput[${index}][title]`}
              value={market.title}
              onChange={(e) => handleInputChange(index, 'title', e.target.value)}
              placeholder={`Enter market ${index + 1} title`}
              required
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor={`market${index}_description`}>Description</FormLabel>
            <TextEditor
              value={market.description}
              readOnly={false}
              onChange={(value) => {
                if (getPlainTextLength(value) <= 1500) {
                  handleInputChange(index, 'description', value)
                }
              }}
            />
            <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
              {getPlainTextLength(market.description)}/1500 characters
            </FormHelperText>
          </FormControl>
        </Box>
      ))}
      <Button onClick={addMarket} colorScheme='blue'>
        Add Another Market
      </Button>
    </>
  )
}
