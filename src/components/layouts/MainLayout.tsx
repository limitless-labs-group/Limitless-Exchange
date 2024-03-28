import { Footer, Header, TabbarMobile } from '@/components'
import { Flex, FlexProps, VStack } from '@chakra-ui/react'

export const MainLayout = ({ children, ...props }: FlexProps) => (
  <Flex
    id='main'
    flexDir={'column'}
    w={'full'}
    minH={'100vh'}
    margin={'0 auto'}
    overflow={'hidden'}
    alignItems={'center'}
    justifyContent={'space-between'}
    {...props}
  >
    <VStack w={'full'} spacing={props.gap ?? { sm: '24px', md: '50px' }}>
      <Header />
      <Flex
        h={'full'}
        w={'full'}
        maxW={'1200px'}
        gap={{ sm: '24px', md: 6 }}
        flexDir={'column'}
        px={{ sm: '16px', md: '24px' }}
      >
        {children}
      </Flex>
    </VStack>
    <Footer />
    {/* <TabbarMobile /> */}
  </Flex>
)
