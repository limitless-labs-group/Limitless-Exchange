'use client'

import { Box, VStack, Text, HStack, Image } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import Skeleton from '@/components/common/skeleton'
import BlogShareLinks from '@/app/blog/components/blog-share-links'
import { MainLayout } from '@/components'
import { useBlogPost } from '@/hooks/use-blog-articles'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { headingLarge, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface BlogPostPageProps {
  slug: string
}

export default function BlogPostPage({ slug }: BlogPostPageProps) {
  const { data, isLoading } = useBlogPost(slug)

  const avatarUrl = `${process.env.NEXT_PUBLIC_BLOG_URL}/assets/${data?.data[0].author.avatar}`

  const author = `${data?.data[0].author.first_name} ${
    data?.data[0].author.last_name ? data.data[0].author.last_name : ''
  }`

  return (
    <MainLayout>
      <HStack
        w='full'
        gap={0}
        justifyContent='space-between'
        alignItems='flex-start'
        marginTop={isMobile ? '36px' : '80px'}
      >
        <VStack gap='24px' maxW='800px' alignItems='flex-start'>
          {isLoading ? (
            <>
              <Box w='full'>
                <Skeleton height={128} />
              </Box>
              <Box maxW='640px'>
                <Skeleton height={20} />
              </Box>
            </>
          ) : (
            <>
              <Text {...headingLarge}>{data?.data[0].title}</Text>
              <Text {...paragraphRegular} color='grey.700' maxW='640px'>
                {data?.data[0].description}
              </Text>
            </>
          )}
        </VStack>
        {!isMobile && <BlogShareLinks slug={slug} />}
      </HStack>
      <Box my={isMobile ? '12px' : '56px'}>
        {isLoading ? (
          <Box w='full'>
            <Skeleton height={isMobile ? 216 : 720} />
          </Box>
        ) : (
          <Image
            src={`${process.env.NEXT_PUBLIC_BLOG_URL}/assets/${data?.data[0].image}`}
            alt='post-image'
            h={isMobile ? '216px' : '720px'}
            w='full'
            objectFit='cover'
            borderRadius='12px'
          />
        )}
      </Box>
      {isLoading ? (
        <Box w='200px'>
          <Skeleton height={24} />
        </Box>
      ) : (
        <HStack mb={isMobile ? '12px' : '56px'} gap='8px'>
          <Image src={avatarUrl} alt='avatar' w='24px' h='24px' />
          <Text {...paragraphRegular} color='grey.500'>
            {author}
          </Text>
          <Box transform='rotate(270deg)' color='grey.500'>
            <ChevronDownIcon height={16} width={16} />
          </Box>
          {/*{data?.data[0].tag.map((tag) => (*/}
          {/*  <Text {...paragraphRegular} color='grey.500' key={tag.tags}>*/}
          {/*    #{tag.tags}*/}
          {/*  </Text>*/}
          {/*))}*/}
        </HStack>
      )}
    </MainLayout>
  )
}
