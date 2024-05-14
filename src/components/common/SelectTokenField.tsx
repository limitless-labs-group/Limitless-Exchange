import { Box, HStack, Image, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { collateralTokensArray, defaultChain, higher } from '@/constants'

type SelectTokenFieldProps = {
  setToken: Dispatch<SetStateAction<string>>
  token: string
  defaultValue: string
}

export default function SelectTokenField({ setToken, token, defaultValue }: SelectTokenFieldProps) {
  useEffect(() => {
    if (!token) {
      setToken(higher.address[defaultChain.id])
    }
  }, [token])

  return (
    <RadioGroup onChange={setToken} defaultValue={defaultValue}>
      <Stack direction='row' overflowX={'scroll'} gap={'12px'}>
        {collateralTokensArray.map((collateralToken) => (
          <Box key={collateralToken.address[defaultChain.id]} minW={'fit-content'}>
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
