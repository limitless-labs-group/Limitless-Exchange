import { Footer, Header } from '@/components'
import { Flex, FlexProps, VStack } from '@chakra-ui/react'

interface IMainLayout extends FlexProps {
  maxContentWidth?: string | number
}

export const MainLayout = ({ children, maxContentWidth, ...props }: IMainLayout) => (
  <Flex
    id='main'
    flexDir={'column'}
    w={'full'}
    minH={'100vh'}
    margin={'0 auto'}
    overflow={'hidden'}
    alignItems={'center'}
    justifyContent={'space-between'}
    gap={{ sm: 6, md: 0 }}
    {...props}
  >
    <VStack w={'full'} spacing={props.gap ?? { sm: 6, md: 12 }}>
      <Header />
      <Flex
        h={'full'}
        w={'full'}
        maxW={maxContentWidth ?? '1000px'}
        gap={6}
        flexDir={'column'}
        px={{ sm: 4, md: 6 }}
      >
        {children}
      </Flex>
    </VStack>
    <Footer />
  </Flex>
)
