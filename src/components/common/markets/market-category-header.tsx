import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { categories } from '@/components/common/markets/sidebar-item'
import { h1Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'

export interface MarketCategoryProps {
  name: string
}

const style = {
  width: '24px',
  height: '24px',
  color: 'var(--chakra-colors-grey-50)',
}

export const MarketCategoryHeader: React.FC<MarketCategoryProps> = ({ name }) => {
  const category = useMemo(() => {
    const foundCategory = categories.find((cat) => cat.name === name)

    if (!foundCategory) {
      return
    }

    return {
      name: foundCategory.name,
      icon: React.cloneElement(foundCategory.icon, { style }),
      description: foundCategory.description ?? '',
      bannerImage: foundCategory.bannerImage,
    }
  }, [name])

  return category ? (
    <VStack alignItems='start' gap='16px' justifyContent='center' width='inherit'>
      {category.bannerImage ? (
        <Box
          w='full'
          maxW='960px'
          h={isMobile ? '162px' : '360px'}
          position='relative'
          overflow='hidden'
          mx='auto'
          mt='20px'
          borderRadius={!isMobile ? '18px' : 'none'}
        >
          <Image
            src={category.bannerImage}
            alt={`${category.name} category banner`}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              position: 'absolute',
            }}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 960px) 80vw, 9600px'
            priority
          />
        </Box>
      ) : null}

      <Flex
        w='full'
        alignItems='center'
        justifyContent='center'
        px='16px'
        my={isMobile ? '20px' : '32px'}
      >
        <HStack gap='8px' w={isMobile ? 'full' : '664px'}>
          <Flex
            h='32px'
            w='32px'
            alignItems='center'
            justifyContent='center'
            bg='grey.800'
            rounded='32px'
          >
            {category.icon}
          </Flex>
          <Text {...h1Bold}>{category.name}</Text>
        </HStack>
      </Flex>
      {category.description ? (
        <Text {...paragraphRegular} color='grey.500'>
          {category.description}
        </Text>
      ) : null}
    </VStack>
  ) : null
}
