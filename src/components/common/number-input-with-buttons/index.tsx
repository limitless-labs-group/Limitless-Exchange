import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputProps,
} from '@chakra-ui/react'
import React from 'react'
import MinusIcon from '@/resources/icons/minus-icon.svg'
import PlusIcon from '@/resources/icons/plus-icon.svg'

type NumberInputWithButtonsProps = NumberInputProps & {
  id: string
  placeHolderText?: string
}

export default function NumberInputWithButtons({
  id,
  placeHolderText,
  ...wrapperProps
}: NumberInputWithButtonsProps) {
  return (
    <NumberInput {...wrapperProps}>
      <NumberInputField id={id} placeholder={placeHolderText} />
      <NumberIncrementStepper
        position='absolute'
        right='12px'
        top='6px'
        zIndex={100}
        w='16px'
        h='16px'
        border='unset'
      >
        <PlusIcon />
      </NumberIncrementStepper>
      <NumberDecrementStepper
        position='absolute'
        right='44px'
        top='6px'
        zIndex={100}
        w='16px'
        h='16px'
        border='unset'
      >
        <MinusIcon />
      </NumberDecrementStepper>
    </NumberInput>
  )
}
