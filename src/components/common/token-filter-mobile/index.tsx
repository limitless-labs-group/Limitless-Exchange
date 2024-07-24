import React, { useState } from 'react'
import { Text, Box, HStack } from '@chakra-ui/react'
import { useCategories } from '@/services'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import '@/app/style.css'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function TokenFilterMobile() {
  const [section, setSection] = useState('Topics')
  const { handleCategory } = useTokenFilter()

  const { data: categories } = useCategories()
  const searchParams = useSearchParams()

  const TopicSectionCategories = () =>
    (categories ?? []).map((category) => {
      const _selected = category.name === searchParams?.get('category')
      return (
        <Box
          bg={_selected ? 'grey.800' : 'grey.300'}
          onClick={() => handleCategory(category)}
          padding='4px 8px'
          key={category.id}
          borderRadius='2px'
          w='fit-content'
          marginBottom='4px'
          cursor='pointer'
        >
          <Link href={{ pathname: '/', query: { category: category.name } }}>
            <Text {...paragraphMedium} color={_selected ? 'white' : 'black'} fontWeight={500}>
              /{category.name}
            </Text>
          </Link>
        </Box>
      )
    })

  const sectionCategory: Record<string, React.JSX.Element | undefined> = {
    Topics: <TopicSectionCategories />,
  }

  return (
    <Box w='full' overflowX='auto' mt='16px' pl='16px'>
      <HStack gap='8px' w='fit-content'>
        {sectionCategory[section]}
      </HStack>
    </Box>
  )
}
