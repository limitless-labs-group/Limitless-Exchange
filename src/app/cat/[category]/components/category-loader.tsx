'use client'

import { Flex, Center } from '@chakra-ui/react'
import React from 'react'
import Loader from '@/components/common/loader'
import { MainLayout } from '@/components'

export default function CategoryLoader() {
  return (
    <MainLayout>
      <Flex width='100%' height='calc(100vh - 100px)' justifyContent='center' alignItems='center'>
        <Center>
          <Loader size='lg' />
        </Center>
      </Flex>
    </MainLayout>
  )
}
