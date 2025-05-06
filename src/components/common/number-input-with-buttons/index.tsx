import { Box, Input, InputGroup, InputProps, InputRightElement } from '@chakra-ui/react'
import { isNumber } from '@chakra-ui/utils'
import { keyframes } from '@emotion/react'
import BigNumber from 'bignumber.js'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import MinusIcon from '@/resources/icons/minus-icon.svg'
import PlusIcon from '@/resources/icons/plus-icon.svg'

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`

type NumberInputWithButtonsProps = InputProps & {
  handleInputChange: (val: string) => void
  showIncrements: boolean
  endAdornment?: JSX.Element
  symbol?: string
  inputType?: 'text' | 'number' | 'tel' | 'decimal' | 'numeric'
}

const NumberInputWithButtons = React.forwardRef<HTMLInputElement, NumberInputWithButtonsProps>(
  (
    {
      handleInputChange,
      showIncrements,
      endAdornment,
      value,
      symbol,
      inputType = 'text',
      max,
      step,

      ...props
    }: NumberInputWithButtonsProps,
    ref
  ) => {
    const [isShaking, setIsShaking] = useState(false)
    const MAX_CHARS = 9
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
          ref={ref}
          variant='grey'
          autoComplete='off'
          onChange={(e) => {
            const newValue = e.target.value.replace(/^0+/, '0').replace(',', '.')
            if (newValue.length > MAX_CHARS) {
              setIsShaking(true)
              return
            }
            handleInputChange(newValue)
          }}
          value={value}
          type={inputType}
          inputMode='decimal'
          pattern='[0-9,.]*'
          animation={isShaking ? `${shakeAnimation} 0.5s ease-in-out` : undefined}
          onAnimationEnd={() => setIsShaking(false)}
          maxLength={MAX_CHARS}
        />
        {value && symbol && (
          <Box
            position='absolute'
            left={`${(value?.toString().length || 0) * 8 + (isMobile ? 20 : 12)}px`}
            top='53%'
            transform='translateY(-50%)'
            pointerEvents='none'
            zIndex={2}
          >
            {symbol}
          </Box>
        )}
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
          <InputRightElement
            h='16px'
            top='8px'
            right={isMobile ? '8px' : '12px'}
            w='fit'
            color='grey.500'
          >
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
)

export default NumberInputWithButtons

NumberInputWithButtons.displayName = ' NumberInputWithButtons'
