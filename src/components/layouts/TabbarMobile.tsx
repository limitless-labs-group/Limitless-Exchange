import { Button } from '@/components'
import { Image, Stack, StackProps } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaGlobe, FaSearch } from 'react-icons/fa'

export const TabbarMobile = ({ ...props }: StackProps) => {
  const router = useRouter()

  return (
    <Stack
      flexDir={'row'}
      display={{ sm: 'flex', md: 'none' }}
      pos={'fixed'}
      bottom={0}
      left={0}
      h={`${40 + 8 * 2}px`}
      w={'full'}
      justifyContent={'space-between'}
      alignItems={'center'}
      py={'8px'}
      px={{ sm: '16px', md: '24px' }}
      spacing={4}
      boxShadow={'0 0 8px #ddd'}
      bg={'bg'}
      zIndex={2}
      {...props}
    >
      <Button w={'full'} h={'40px'} colorScheme={'transparent'} onClick={() => router.push('/')}>
        <FaGlobe size={'20px'} />
      </Button>
    </Stack>
  )
}
