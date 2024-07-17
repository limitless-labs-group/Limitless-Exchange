import React from 'react'
import { Text, Box, useTheme, VStack } from '@chakra-ui/react'
import { Category } from '@/types'
import { useTokenFilter } from '@/contexts/TokenFilterContext'

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
          <Box
            key={category.id}
            bg={selectedCategory === category ? 'black' : 'grey.300'}
            color={selectedCategory === category ? 'grey.50' : 'grey.800'}
            p='8px'
            px='10px'
            borderRadius='2px'
            w='fit-content'
            marginBottom='4px'
            cursor='pointer'
            onClick={() => handleFilterItemClicked(category)}
          >
            <Text
              color={selectedCategory?.id === category.id ? 'grey.50' : 'grey.800'}
              fontWeight={500}
            >
              /{category.name}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}
