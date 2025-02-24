import { Box, Input, InputGroup, InputProps, InputRightElement } from '@chakra-ui/react'
import { isNumber } from '@chakra-ui/utils'
import BigNumber from 'bignumber.js'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MinusIcon from '@/resources/icons/minus-icon.svg'
import PlusIcon from '@/resources/icons/plus-icon.svg'

type NumberInputWithButtonsProps = InputProps & {
  handleInputChange: (val: string) => void
  showIncrements: boolean
  endAdornment?: JSX.Element
  inputType?: 'text' | 'number' | 'tel' | 'decimal' | 'numeric'
}

export default function NumberInputWithButtons({
  handleInputChange,
  showIncrements,
  endAdornment,
  value,
  inputType = 'text',
  max,
  step,
  ...props
}: NumberInputWithButtonsProps) {
  const handlePlusIconClicked = () => {
    if (isNumber(max)) {
      if (+(value as string) + (step as number) > +max) {
        return
      }
      handleInputChange(
        new BigNumber((value as string) || '0').plus(new BigNumber(step as string)).toString()
      )
      return
    }
    handleInputChange(
      new BigNumber((value as string) || '0').plus(new BigNumber(step as string)).toString()
    )
    return
  }
  const handleMinusIconClicked = () => {
    if (!value) {
      return
    }
    if (+value < (step as number)) {
      handleInputChange('')
      return
    }
    handleInputChange(
      new BigNumber(value as string).minus(new BigNumber(step as string)).toString()
    )
    return
  }

  return (
    <InputGroup position='relative'>
      <Input
        {...props}
        variant='grey'
        autoComplete='off'
        onChange={(e) => handleInputChange(e.target.value.replace(/^0+/, '0').replace(',', '.'))}
        value={value}
        type={inputType}
        inputMode='decimal'
        pattern='[0-9,.]*'
      />
      {showIncrements && (
        <>
          <Box
            position='absolute'
            right='12px'
            top='8px'
            zIndex={100}
            w='16px'
            h='16px'
            cursor='pointer'
            onClick={handlePlusIconClicked}
          >
            <PlusIcon />
          </Box>
          <Box
            position='absolute'
            right='44px'
            top='8px'
            zIndex={100}
            w='16px'
            h='16px'
            cursor='pointer'
            onClick={handleMinusIconClicked}
          >
            <MinusIcon />
          </Box>
        </>
      )}
      {endAdornment && (
        <InputRightElement h='16px' top='8px' right={isMobile ? '8px' : '12px'} w='fit'>
          {endAdornment}
        </InputRightElement>
      )}
    </InputGroup>
  )
}
