import { Box, Input, InputGroup, InputProps, InputRightElement } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { SyntheticEvent } from 'react'
import { isMobile } from 'react-device-detect'
import MinusIcon from '@/resources/icons/minus-icon.svg'
import PlusIcon from '@/resources/icons/plus-icon.svg'

type NumberInputWithButtonsProps = InputProps & {
  handleInputChange: (val: string) => void
  showIncrements: boolean
  endAdornment?: JSX.Element
}

export default function NumberInputWithButtons({
  handleInputChange,
  showIncrements,
  endAdornment,
  value,
  max,
  step,
  ...props
}: NumberInputWithButtonsProps) {
  const handlePlusIconClicked = (e: SyntheticEvent) => {
    if (max) {
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
        variant='outlined'
        inputMode='numeric'
        type='number'
        {...props}
        autoComplete='off'
        onChange={(e) =>
          handleInputChange(
            e.target.value.replace(/^0+/, '0').replace(/^0\d/, (value as string).slice(1))
          )
        }
        value={value}
        pattern='[0-9,]*'
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
    // <NumberInput {...wrapperProps} errorBorderColor='red.500'>
    //   <NumberInputField id={id} placeholder={placeHolderText} pattern={undefined} />
    //   <NumberIncrementStepper
    //     position='absolute'
    //     right='12px'
    //     top='6px'
    //     zIndex={100}
    //     w='16px'
    //     h='16px'
    //     border='unset'
    //   >
    //     <PlusIcon />
    //   </NumberIncrementStepper>
    //   <NumberDecrementStepper
    //     position='absolute'
    //     right='44px'
    //     top={isMobile ? '8px' : '6px'}
    //     zIndex={100}
    //     w='16px'
    //     h='16px'
    //     border='unset'
    //   >
    //     <MinusIcon />
    //   </NumberDecrementStepper>
    // </NumberInput>
  )
}
