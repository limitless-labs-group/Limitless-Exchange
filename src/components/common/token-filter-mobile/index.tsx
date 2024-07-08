import React, { useState } from 'react'
import {
  Text,
  Box,
  useTheme,
  Button,
  HStack,
  useDisclosure,
  VStack,
  Flex,
  Slide,
} from '@chakra-ui/react'
import { Token } from '@/types'
import {
  ClickEvent,
  CreateMarketClickedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useLimitlessApi,
} from '@/services'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import MenuIcon from '@/resources/icons/menu-icon.svg'
import { Image as ChakraImage } from '@chakra-ui/image/dist/image'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import { NumberUtil } from '@/utils'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import Image from 'next/image'

export default function TokenFilterMobile() {
  const [category, setCategory] = useState('')
  const { selectedFilterTokens, handleTokenChange } = useTokenFilter()

  const { supportedTokens } = useLimitlessApi()
  const { isOpen: isOpenTagsMenu, onToggle: onToggleTagsMenu } = useDisclosure()

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

  const categories = ['Crypto']

  return (
    <Box w='full' overflowX='auto' mt='16px' pl='16px'>
      <HStack gap='8px' w='fit-content'>
        <Button variant='grey' onClick={onToggleTagsMenu} mr='8px'>
          <MenuIcon width={16} height={16} />
          <Text fontWeight={500}>{!category ? 'All Markets' : `All in ${category}`}</Text>
        </Button>
        {!category
          ? categories.map((category) => (
              <Button variant='grey' key={category} onClick={() => setCategory(category)}>
                <Text fontWeight={500}>/{category}</Text>
              </Button>
            ))
          : supportedTokens?.map((token) => (
              <Button
                bg={
                  selectedFilterTokens.findLast((_token) => _token.address === token.address)
                    ? 'black'
                    : 'grey.300'
                }
                color={
                  selectedFilterTokens.findLast((_token) => _token.address === token.address)
                    ? 'white'
                    : 'black'
                }
                variant='grey'
                key={token.symbol}
                onClick={() => handleFilterItemClicked(token)}
              >
                <Text
                  color={
                    selectedFilterTokens.findLast((_token) => _token.address === token.address)
                      ? 'white'
                      : 'black'
                  }
                  fontWeight={500}
                >
                  /{token.symbol}
                </Text>
              </Button>
            ))}
      </HStack>
      <Slide
        direction='left'
        in={isOpenTagsMenu}
        style={{ zIndex: 100, background: 'rgba(0, 0, 0, 0.3)', marginTop: '20px' }}
        onClick={onToggleTagsMenu}
      >
        <Box p='16px' w='80%' bg='white' h='full' onClick={(e) => e.stopPropagation()}>
          <Image src={'/logo-black.svg'} height={32} width={156} alt='calendar' />
          <Box mt='28px'>
            <Text fontWeight={500} color='grey.600'>
              {categories[0]}
            </Text>
          </Box>
          <VStack gap='4px' mt='4px' alignItems='flex-start'>
            <Button
              bg={category === categories[0] && !selectedFilterTokens.length ? 'black' : 'grey.300'}
              variant='grey'
              color={category === categories[0] && !selectedFilterTokens.length ? 'white' : 'black'}
              onClick={() => {
                if (selectedFilterTokens.length) {
                  handleFilterItemClicked(null)
                  return
                }
                setCategory(categories[0])
              }}
            >
              /All
            </Button>
            {supportedTokens?.map((token) => (
              <Button
                bg={
                  selectedFilterTokens.findLast((_token) => _token.address === token.address)
                    ? 'black'
                    : 'grey.300'
                }
                color={
                  selectedFilterTokens.findLast((_token) => _token.address === token.address)
                    ? 'white'
                    : 'black'
                }
                variant='grey'
                key={token.symbol}
                onClick={() => handleFilterItemClicked(token)}
              >
                <Text
                  color={
                    selectedFilterTokens.findLast((_token) => _token.address === token.address)
                      ? 'white'
                      : 'black'
                  }
                  fontWeight={500}
                >
                  /{token.symbol}
                </Text>
              </Button>
            ))}
          </VStack>
        </Box>
      </Slide>
    </Box>
  )
}
