import React, { useEffect, useState } from 'react'
import { Text, Box, useTheme } from '@chakra-ui/react'
import { useCategories } from '@/services'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CategoryFilter() {
  const { data: categories } = useCategories()
  const searchParams = useParams()

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
            category.name.toLowerCase() === searchParams?.topic
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
          <Link href={`/topics/${category.name.toLowerCase()}`}>
            <Text
              color={category.name.toLowerCase() === searchParams?.topic ? 'white' : 'black'}
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
