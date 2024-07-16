import React from 'react'
import { Text, Box, useTheme } from '@chakra-ui/react'
import { Category } from '@/types'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function CategoryFilter() {
  const { selectedCategory, handleCategory } = useTokenFilter()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`)
      return response.data as Category[]
    },
  })

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
          bg={selectedCategory?.id === category.id ? 'black' : theme.colors.grey['300']}
          padding='2px 4px'
          key={category.id}
          borderRadius='2px'
          w='fit-content'
          marginBottom='4px'
          cursor='pointer'
          onClick={() => handleFilterItemClicked(category)}
        >
          <Text color={selectedCategory?.id === category.id ? 'white' : 'black'} fontWeight={500}>
            /{category.name}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
