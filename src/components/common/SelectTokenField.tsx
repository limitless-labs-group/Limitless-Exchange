import { Box, HStack, Image, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import { useLimitlessApi } from '@/services'

type SelectTokenFieldProps = {
  setToken: Dispatch<SetStateAction<Address>>
  token: Address
  defaultValue: Address
}

export default function SelectTokenField({ setToken, token, defaultValue }: SelectTokenFieldProps) {
  const { supportedTokens } = useLimitlessApi()

  useEffect(() => {
    if (!token && supportedTokens) {
      setToken(supportedTokens[0].address)
    }
  }, [token, supportedTokens])

  return (
    <RadioGroup onChange={(val: string) => setToken(val as Address)} defaultValue={defaultValue}>
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
