import React from 'react'
import { Text, Box } from '@chakra-ui/react'
import { ClickEvent, useAmplitude, useCategories } from '@/services'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import usePageName from '@/hooks/use-page-name'

export default function CategoryFilter() {
  /**
   * ANALITYCS
   */
  const { trackClicked } = useAmplitude()
  const pageName = usePageName()

  const { data: categories } = useCategories()
  const searchParams = useSearchParams()

  return (
    <Box marginTop='24px' w='full' px='8px'>
      <Text
        fontSize='12px'
        color='grey.600'
        fontWeight='500'
        textTransform='uppercase'
        marginBottom='4px'
      >
        Topics
      </Text>
      {categories?.map((category) => (
        <Box
          bg={category.name === searchParams?.get('category') ? 'grey.800' : 'grey.300'}
          padding='2px 4px'
          key={category.id}
          borderRadius='2px'
          w='fit-content'
          marginBottom='4px'
          cursor='pointer'
          _hover={{
            bg: category.name === searchParams?.get('category') ? 'grey.800' : 'grey.400',
          }}
        >
          <Link
            href={{ pathname: '/markets', query: { category: category.name } }}
            onClick={() => {
              trackClicked(ClickEvent.CategoryClicked, {
                name: category.name,
                page: pageName,
              })
            }}
          >
            <Text
              color={category.name === searchParams?.get('category') ? 'grey.50' : 'grey.800'}
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
