import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useCategories } from '@/services'
import { h1Bold } from '@/styles/fonts/fonts.styles'

export interface MarketCategoryProps {
  name: string
}

export const MarketCategoryHeader: React.FC<MarketCategoryProps> = ({ name }) => {
  const { data: categories } = useCategories()
  const category = useMemo(() => {
    const foundCategory = categories?.find((cat) => cat.name === name)

    if (!foundCategory) {
      return
    }

    return {
      name: foundCategory.name,
    }
  }, [name, categories])

  return category ? (
    <VStack alignItems='start' gap='16px' justifyContent='center' width='inherit'>
      <Flex
        w='full'
        alignItems='center'
        justifyContent='center'
        px='16px'
        my={isMobile ? '20px' : '32px'}
      >
        <HStack gap='8px' w={isMobile ? 'full' : '664px'}>
          <Text {...h1Bold}>{category.name}</Text>
        </HStack>
      </Flex>
    </VStack>
  ) : null
}
