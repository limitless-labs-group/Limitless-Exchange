import { Text, Box, useTheme } from '@chakra-ui/react'
import React from 'react'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useLimitlessApi } from '@/services'
import { Token } from '@/types'

export default function TokenFilter() {
  const { selectedFilterTokens, handleTokenChange } = useTokenFilter()

  const { supportedTokens } = useLimitlessApi()
  const theme = useTheme()

  const handleFilterItemClicked = (token: Token | null) => {
    if (!token) {
      handleTokenChange([])
      return
    }
    if (selectedFilterTokens.find((_token) => _token.address == token.address)) {
      handleTokenChange(selectedFilterTokens.filter((_token) => _token.address != token.address))
    } else {
      handleTokenChange([...selectedFilterTokens, token])
    }
  }

  return (
    <Box marginTop='24px' w='full' px='8px'>
      <Text
        fontSize='12px'
        color={theme.colors.grey['600']}
        fontWeight='500'
        textTransform='uppercase'
        marginBottom='4px'
      >
        Tokens
      </Text>
      <Box
        padding='2px 4px'
        key={'ALL'}
        borderRadius='8px'
        w='fit-content'
        marginBottom='4px'
        cursor='pointer'
        bg={selectedFilterTokens.length === 0 ? 'grey.800' : theme.colors.grey['300']}
        _hover={{
          bg: selectedFilterTokens.length === 0 ? 'grey.800' : 'grey.400',
        }}
        onClick={() => handleFilterItemClicked(null)}
      >
        <Text color={selectedFilterTokens.length === 0 ? 'grey.50' : 'grey.800'} fontWeight={500}>
          /All
        </Text>
      </Box>
      {supportedTokens
        ?.filter((token) => !['MFER', 'BETS'].includes(token.symbol))
        .map((token) => (
          <Box
            bg={
              selectedFilterTokens.findLast((_token) => _token.address === token.address)
                ? 'grey.800'
                : theme.colors.grey['300']
            }
            padding='2px 4px'
            key={token.symbol}
            borderRadius='8px'
            w='fit-content'
            marginBottom='4px'
            cursor='pointer'
            onClick={() => handleFilterItemClicked(token)}
            _hover={{
              bg: selectedFilterTokens.findLast((_token) => _token.address === token.address)
                ? 'grey.800'
                : 'grey.400',
            }}
          >
            <Text
              color={
                selectedFilterTokens.findLast((_token) => _token.address === token.address)
                  ? 'grey.50'
                  : 'grey.800'
              }
              fontWeight={500}
            >
              /{token.symbol}
            </Text>
          </Box>
        ))}
    </Box>
  )
}
