import React from 'react'
import { Text, Box, useTheme, VStack } from '@chakra-ui/react'
import { Category } from '@/types'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { Chip } from '@/components/common/categories-mobile/chip'

export interface ICategoryFilterMobile {
  categories: Category[]
}

export default function CategoryFilterMobile({ categories }: ICategoryFilterMobile) {
  const theme = useTheme()
  const { selectedCategory, handleCategory } = useTokenFilter()

  const handleFilterItemClicked = (category: Category) => {
    if (category.id === selectedCategory?.id) {
      handleCategory(undefined)
      return
    }
    handleCategory(category)
  }

  return (
    <Box marginTop='24px' w='full'>
      <Text
        fontSize='12px'
        color={theme.colors.grey['600']}
        fontWeight='500'
        textTransform='uppercase'
        marginBottom='4px'
      >
        Topics
      </Text>

      <VStack gap='1px' mt='4px' alignItems='flex-start'>
        {categories?.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory?.id === category.id}
            onClick={() => handleFilterItemClicked(category)}
          >
            {category.name}
          </Chip>
        ))}
      </VStack>
    </Box>
  )
}
