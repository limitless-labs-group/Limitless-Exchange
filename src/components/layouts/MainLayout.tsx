import { Box, Flex, FlexProps, HStack, Spinner } from '@chakra-ui/react'
import Sidebar from '@/components/layouts/sidebar'
import { isMobile } from 'react-device-detect'
import React from 'react'
import MobileHeader from '@/components/layouts/mobile-header'
import HeaderMarquee from '@/components/layouts/header-marquee'

interface IMainLayout extends FlexProps {
  isLoading?: boolean
}

export const MainLayout = ({ children, isLoading, ...props }: IMainLayout) => {
  return (
    <Box
      id='main'
      flexDir={'column'}
      w={'full'}
      minH={'100vh'}
      margin={'0 auto'}
      overflow={'hidden'}
      alignItems={'center'}
      justifyContent={'space-between'}
      gap={{ sm: 6, md: 10 }}
      bg='grey.100'
      {...props}
    >
      <HeaderMarquee />
      <Box mt='20px'>
        {isMobile && <MobileHeader />}
        <HStack minH={'calc(100vh - 20px)'} alignItems='flex-start'>
          {!isMobile && <Sidebar />}
          {isLoading ? (
            <Flex w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
              <Spinner />
            </Flex>
          ) : (
            <Box ml={isMobile ? 0 : '200px'} p={'16px'} w='full'>
              {children}
            </Box>
          )}
        </HStack>
      </Box>
    </Box>
  )
}
