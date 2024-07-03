import { Header } from '@/components'
import { Box, Flex, FlexProps, HStack, Spinner } from '@chakra-ui/react'
import Sidebar from '@/components/layouts/sidebar'

interface IMainLayout extends FlexProps {
  maxContentWidth?: string | number
  isLoading?: boolean
}

export const MainLayout = ({ children, isLoading, ...props }: IMainLayout) => (
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
    {...props}
  >
    <Header />
    <HStack minH={'calc(100vh - 20px)'} alignItems='flex-start'>
      <Sidebar />
      {isLoading ? (
        <Flex w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
          <Spinner />
        </Flex>
      ) : (
        <Box p={'16px'}>{children}</Box>
      )}
    </HStack>
  </Box>
)
