import React from 'react'
import { Text, Box, useTheme } from '@chakra-ui/react'
import { Category } from '@/types'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useCategories } from '@/services'

export default function CategoryFilter() {
  const { selectedCategory, handleCategory } = useTokenFilter()

  const { data: categories } = useCategories()

  const theme = useTheme()

  const handleFilterItemClicked = (category: Category) => {
    if (category.id === selectedCategory?.id) {
      handleCategory(undefined)
      return
    }
    handleCategory(category)
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
        Topics
      </Text>
      {categories?.map((category) => (
        <Box
          bg={selectedCategory?.id === category.id ? 'grey.800' : theme.colors.grey['300']}
          padding='2px 4px'
          key={category.id}
          borderRadius='2px'
          w='fit-content'
          marginBottom='4px'
          cursor='pointer'
          onClick={() => handleFilterItemClicked(category)}
          _hover={{
            bg: selectedCategory?.id === category.id ? 'grey.800' : 'grey.400',
          }}
        >
          <Text color={selectedCategory?.id === category.id ? 'white' : 'black'} fontWeight={500}>
            /{category.name}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
