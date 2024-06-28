import { Header } from '@/components'
import { Box, Flex, FlexProps, HStack, VStack } from '@chakra-ui/react'
import Sidebar from '@/components/layouts/sidebar'

interface IMainLayout extends FlexProps {
  maxContentWidth?: string | number
}

export const MainLayout = ({ children, maxContentWidth, ...props }: IMainLayout) => (
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
    <HStack minH={'calc(100vh - 20px)'}>
      <Sidebar />
      {children}
    </HStack>
  </Box>
)
