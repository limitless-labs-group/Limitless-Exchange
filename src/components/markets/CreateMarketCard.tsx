import { Button } from '@/components'
import { borderRadius, colors } from '@/styles'
import { Heading, Image, Stack, Text } from '@chakra-ui/react'

export const CreateMarketCard = () => {
  return (
    <Stack
      w={'full'}
      border={`1px solid ${colors.border}`}
      borderRadius={borderRadius}
      spacing={0}
      cursor={'pointer'}
      onClick={() =>
        window.open(
          'https://limitlesslabs.notion.site/Limitless-Creators-101-fbbde33a51104fcb83c57f6ce9d69d2a?pvs=4',
          '_blank'
        )
      }
    >
      <Image
        src={'/assets/images/create-market.svg'}
        w={{ sm: 'full' }}
        h={{ sm: '200px', md: '150px' }}
        fit={'contain'}
        bg={'bgLight'}
        borderRadius={borderRadius}
        borderEndStartRadius={0}
        borderEndEndRadius={0}
        p={4}
      />

      <Stack
        h={'full'}
        p={3}
        alignItems={'center'}
        textAlign={'center'}
        justifyContent={'space-between'}
      >
        <Stack>
          <Heading fontSize={'18px'} lineHeight={'24px'}>
            Get started with Limitless
          </Heading>
          <Text color={'fontLight'}>
            Learn how to create your markets and join the movement. Have skin in your beliefs.
          </Text>
        </Stack>
        <Button
          bg={'brand'}
          color={'white'}
          h={'40px'}
          w={'full'}
          p={1}
          // onClick={() => router.push(marketURI)}
        >
          Create own market
        </Button>
      </Stack>
    </Stack>
  )
}
