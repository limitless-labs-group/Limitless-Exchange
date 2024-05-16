import { Box, HStack, Image, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { collateralTokensArray, defaultChain, higher } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'

type SelectTokenFieldProps = {
  setToken: Dispatch<SetStateAction<Address>>
  token: Address
  defaultValue: Address
}

export default function SelectTokenField({ setToken, token, defaultValue }: SelectTokenFieldProps) {
  useEffect(() => {
    if (!token) {
      setToken(higher.address[defaultChain.id])
    }
  }, [token])

  return (
    <RadioGroup onChange={(val: string) => setToken(val as Address)} defaultValue={defaultValue}>
      <Stack direction='row' overflowX={'scroll'} gap={'20px'}>
        {collateralTokensArray.map((collateralToken) => (
          <Box key={uuidv4()} minW={'fit-content'}>
            <Radio
              value={collateralToken.address[defaultChain.id]}
              colorScheme='blackVariants'
              checked={
                collateralToken.address[defaultChain.id].toLowerCase() === token.toLowerCase()
              }
            >
              <HStack gap='2px'>
                <Image src={collateralToken.imageURI} alt='token' width={'20px'} height={'20px'} />
                <Text>{collateralToken.symbol}</Text>
              </HStack>
            </Radio>
          </Box>
        ))}
      </Stack>
    </RadioGroup>
  )
}
