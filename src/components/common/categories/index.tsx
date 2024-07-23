import React, { useEffect } from 'react'
import { Text, Box, useTheme } from '@chakra-ui/react'
import { useCategories } from '@/services'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CategoryFilter() {
  const { data: categories } = useCategories()
  const searchParams = useSearchParams()

  const theme = useTheme()

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
          bg={
            category.name === searchParams?.get('category')
              ? theme.colors.grey['800']
              : theme.colors.grey['300']
          }
          padding='2px 4px'
          key={category.id}
          borderRadius='2px'
          w='fit-content'
          marginBottom='4px'
          cursor='pointer'
        >
          <Link href={{ pathname: '/', query: { category: category.name } }}>
            <Text
              color={category.name === searchParams?.get('category') ? 'white' : 'black'}
              fontWeight={500}
            >
              /{category.name}
            </Text>
          </Link>
        </Box>
      ))}
    </Box>
  )
}
