import React, { useState } from 'react'
import { Text, Box, Button, HStack, useDisclosure, VStack, Slide } from '@chakra-ui/react'
import { Token } from '@/types'
import { useCategories, useLimitlessApi } from '@/services'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import MenuIcon from '@/resources/icons/menu-icon.svg'
import Image from 'next/image'
import '@/app/style.css'
import CategoryFilterMobile from '@/components/common/categories-mobile'
import Link from 'next/link'

const sections = ['Crypto', 'Topics']

export default function TokenFilterMobile() {
  const [section, setSection] = useState('')
  const { selectedFilterTokens, selectedCategory, handleTokenChange, handleCategory } =
    useTokenFilter()

  const { supportedTokens } = useLimitlessApi()
  const { data: categories } = useCategories()
  const { isOpen: isOpenTagsMenu, onToggle: onToggleTagsMenu } = useDisclosure()

  const handleFilterItemClicked = (token: Token | null) => {
    if (!token) {
      handleTokenChange([])
      return
    }
    if (selectedFilterTokens.find((_token) => _token.address == token.address)) {
      handleTokenChange(selectedFilterTokens.filter((_token) => _token.address != token.address))
    } else {
      handleTokenChange([...selectedFilterTokens, token])
    }
  }

  const CryptoSectionCategories = () =>
    supportedTokens
      ?.filter((token) => !['MFER', 'BETS'].includes(token.symbol))
      .map((token) => {
        const _selected = selectedFilterTokens.findLast(
          (_token) => _token.address === token.address
        )
        return (
          <Button
            bg={_selected ? 'grey.800' : 'grey.300'}
            color={_selected ? 'grey.50' : 'grey.800'}
            variant='grey'
            key={token.symbol}
            onClick={() => handleFilterItemClicked(token)}
          >
            <Text color={_selected ? 'grey.50' : 'grey.800'} fontWeight={500}>
              /{token.symbol}
            </Text>
          </Button>
        )
      })
  const TopicSectionCategories = () =>
    (categories ?? []).map((category) => {
      const _selected = selectedCategory?.id === category.id
      return (
        <Button
          bg={_selected ? 'grey.800' : 'grey.300'}
          color={_selected ? 'grey.50' : 'grey.800'}
          variant='grey'
          key={category.id}
          onClick={() => handleCategory(category)}
        >
          <Link href={`/topics/${category.name.toLowerCase()}`}>
            <Text color={_selected ? 'grey.50' : 'grey.800'} fontWeight={500}>
              /{category.name}
            </Text>
          </Link>
        </Button>
      )
    })

  const sectionCategory: Record<string, React.JSX.Element | undefined> = {
    Crypto: <CryptoSectionCategories />,
    Topics: <TopicSectionCategories />,
  }

  return (
    <Box w='full' overflowX='auto' mt='16px' pl='16px'>
      <HStack gap='8px' w='fit-content'>
        <Button variant='grey' onClick={onToggleTagsMenu} mr='8px'>
          <MenuIcon width={16} height={16} />
          <Text fontWeight={500}>{!section ? 'All Markets' : `All in ${section}`}</Text>
        </Button>
        {!section
          ? sections.map((section) => (
              <Button variant='grey' key={section} onClick={() => setSection(section)}>
                <Text fontWeight={500}>/{section}</Text>
              </Button>
            ))
          : sectionCategory[section]}
      </HStack>
      {isOpenTagsMenu && (
        <Box
          position='fixed'
          top={0}
          left={0}
          bottom={0}
          w='full'
          zIndex={100}
          bg='rgba(0, 0, 0, 0.3)'
          mt='20px'
          animation='fadeIn 0.5s'
        ></Box>
      )}
      <Slide
        direction='left'
        in={isOpenTagsMenu}
        style={{ zIndex: 100, marginTop: '20px', transition: '0.1s', overflowY: 'auto' }}
        onClick={onToggleTagsMenu}
      >
        <Box
          overflowY='auto'
          p='16px'
          w='80%'
          bg='grey.100'
          h='full'
          onClick={(e) => e.stopPropagation()}
        >
          <Image src={'/logo-black.svg'} height={32} width={156} alt='calendar' />

          <CategoryFilterMobile categories={categories ?? []} />

          <Box mt='28px'>
            <Text fontWeight={500} color='grey.600'>
              {sections[0]}
            </Text>
          </Box>
          <VStack gap='1px' mt='4px' alignItems='flex-start'>
            <Box
              bg={section === sections[0] && !selectedFilterTokens.length ? 'black' : 'grey.300'}
              color={
                section === sections[0] && !selectedFilterTokens.length ? 'grey.50' : 'grey.800'
              }
              p='8px'
              px='10px'
              borderRadius='2px'
              w='fit-content'
              marginBottom='4px'
              cursor='pointer'
              onClick={() => {
                if (selectedFilterTokens.length) {
                  handleFilterItemClicked(null)
                  return
                }
                setSection(sections[0])
              }}
            >
              <Text
                color={
                  section === sections[0] && !selectedFilterTokens.length ? 'grey.50' : 'grey.800'
                }
                fontWeight={500}
              >
                /All
              </Text>
            </Box>

            {supportedTokens?.map((token) => {
              const _selected = selectedFilterTokens.findLast(
                (_token) => _token.address === token.address
              )

              return (
                <Box
                  key={token.symbol}
                  bg={_selected ? 'black' : 'grey.300'}
                  color={_selected ? 'grey.50' : 'grey.800'}
                  p='8px'
                  px='10px'
                  borderRadius='2px'
                  w='fit-content'
                  marginBottom='4px'
                  cursor='pointer'
                  onClick={() => handleFilterItemClicked(token)}
                >
                  <Text color={_selected ? 'grey.50' : 'grey.800'} fontWeight={500}>
                    /{token.symbol}
                  </Text>
                </Box>
              )
            })}
          </VStack>
        </Box>
      </Slide>
    </Box>
  )
}
