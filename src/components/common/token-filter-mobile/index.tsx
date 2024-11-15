import { Text, Box, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import '@/app/style.css'
import usePageName from '@/hooks/use-page-name'
import { ClickEvent, useAmplitude, useCategories } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function TokenFilterMobile() {
  const [section, setSection] = useState('Topics')

  const { data: categories } = useCategories()
  const searchParams = useSearchParams()

  const { trackClicked } = useAmplitude()
  const pageName = usePageName()

  const TopicSectionCategories = () =>
    (categories ?? []).map((category) => {
      const _selected = category.name === searchParams?.get('category')
      return (
        <Box
          bg={_selected ? 'grey.800' : 'grey.100'}
          padding='4px 8px'
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
            <Text {...paragraphMedium} color={_selected ? 'grey.50' : 'grey.800'} fontWeight={500}>
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
