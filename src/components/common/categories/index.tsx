import { Text, Box } from '@chakra-ui/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import usePageName from '@/hooks/use-page-name'
import { ClickEvent, useAmplitude, useCategories } from '@/services'

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
          bg={category.name === searchParams?.get('category') ? 'grey.800' : 'grey.100'}
          padding='2px 4px'
          key={category.id}
          borderRadius='8px'
          w='fit-content'
          marginBottom='4px'
          cursor='pointer'
          _hover={{
            bg: category.name === searchParams?.get('category') ? 'grey.800' : 'grey.400',
          }}
        >
          <Link
            href={{ pathname: '/', query: { category: category.name } }}
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
