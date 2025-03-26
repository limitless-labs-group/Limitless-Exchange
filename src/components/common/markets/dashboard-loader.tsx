import { VStack, Flex } from '@chakra-ui/react'
import Skeleton from '../skeleton'

export const DashboardLoader = () => {
  return (
    <>
      <VStack gap={4} w='full'>
        <Skeleton height={420} />
        <Skeleton height={160} />
      </VStack>
      <Flex flexWrap='wrap' gap={4} w='full'>
        <Skeleton height={160} />
        <Skeleton height={160} />
      </Flex>
      <VStack spacing={4} w='full'>
        <Skeleton height={240} />
        <Flex w='full' gap='12px' justifyContent='space-between'>
          <Skeleton height={160} />
          <Skeleton height={160} />
          <Skeleton height={160} />
        </Flex>
      </VStack>
    </>
  )
}
