import { Box, HStack, Image, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import { useLimitlessApi } from '@/services'
import { Token } from '@/types'

type SelectTokenFieldProps = {
  setToken: Dispatch<SetStateAction<Address>>
  token: Address
  defaultValue: Address
}

export default function SelectTokenField({ setToken, token }: SelectTokenFieldProps) {
  const { supportedTokens } = useLimitlessApi()

  return (
    <RadioGroup
      onChange={(val: string) => setToken(val as Address)}
      defaultValue={supportedTokens?.[0].address}
    >
      <Stack direction='row' overflowX={'scroll'} gap={'20px'}>
        {supportedTokens?.map((collateralToken) => (
          <Box key={uuidv4()} minW={'fit-content'}>
            <Radio
              value={collateralToken.address}
              colorScheme='blackVariants'
              checked={collateralToken.address.toLowerCase() === token.toLowerCase()}
            >
              <HStack gap='2px'>
                <Image src={collateralToken.logoUrl} alt='token' width={'20px'} height={'20px'} />
                <Text>{collateralToken.symbol}</Text>
              </HStack>
            </Radio>
          </Box>
        ))}
      </Stack>
    </RadioGroup>
  )
}
