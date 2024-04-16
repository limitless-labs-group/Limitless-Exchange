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
    gap={{ sm: 6, md: 0 }}
    {...props}
  >
    <VStack w={'full'} spacing={props.gap ?? { sm: 6, md: 12 }}>
      <Header />
      <Flex h={'full'} w={'full'} maxW={'1000px'} gap={6} flexDir={'column'} px={{ sm: 4, md: 6 }}>
        {children}
      </Flex>
    </VStack>
    <Footer />
    {/* <TabbarMobile /> */}
  </Flex>
)
