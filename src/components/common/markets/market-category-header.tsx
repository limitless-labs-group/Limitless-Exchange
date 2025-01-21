import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { categories } from '@/components/common/markets/sidebar-item'
import { h1Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'

export interface MarketCategoryProps {
  name: string
}

const style = {
  width: '24px',
  height: '24px',
}

export const MarketCategoryHeader: React.FC<MarketCategoryProps> = ({ name }) => {
  const category = useMemo(() => {
    const foundCategory = categories.find((cat) => cat.name === name)

    if (!foundCategory) {
      return
    }

    return {
      name: foundCategory.name,
      icon: React.cloneElement(foundCategory.icon, { style }),
      description: foundCategory.description ?? '',
    }
  }, [name])

  return category ? (
    <VStack
      alignItems='start'
      gap='16px'
      mt='32px'
      mb='46px'
      width='inherit'
      px={isMobile ? '16px' : 'unset'}
    >
      <HStack gap='4px'>
        <Box>{category.icon}</Box>
        <Text {...h1Bold}>{category.name}</Text>
      </HStack>
      {category.description ? (
        <Text {...paragraphRegular} color='grey.500'>
          {category.description}
        </Text>
      ) : null}
    </VStack>
  ) : null
}
