import { Button, ButtonGroup, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export type SwitcherMode = 'default'

export interface SwitcherOption {
  text: string
  color: string
  bg: string
  value: boolean
}

export interface SwitcherConfig {
  icon?: React.ReactNode
  label?: string
  options: [SwitcherOption, SwitcherOption]
}

export interface SwitcherProps {
  mode: SwitcherMode
  isOn: boolean
  onSwitch: (newValue: boolean) => void
  icon?: React.ReactNode
  label?: string
}

const switcherConfigs: Record<SwitcherMode, SwitcherConfig> = {
  default: {
    options: [
      {
        text: 'Yes',
        color: 'green.500',
        bg: 'green.100',
        value: true,
      },
      {
        text: 'No',
        color: 'red.500',
        bg: 'red.100',
        value: false,
      },
    ],
  },
}

export const Switcher = ({ mode, isOn, onSwitch, icon, label }: SwitcherProps) => {
  const config = switcherConfigs[mode]

  const displayIcon = icon || config.icon
  const displayLabel = label || config.label

  const [onOption, offOption] = config.options

  return (
    <HStack w='full' justifyContent='space-between' px='8px'>
      {(displayIcon || displayLabel) && (
        <HStack gap='4px'>
          {displayIcon && displayIcon}
          {displayLabel && <Text {...paragraphMedium}>{displayLabel}</Text>}
        </HStack>
      )}
      <ButtonGroup
        variant='outline'
        gap='2px'
        p='2px'
        borderRadius='8px'
        bg={isOn ? 'green.100' : 'red.100'}
      >
        {[onOption, offOption].map((option) => (
          <Button
            key={option.text}
            border='none'
            bg={option.value === isOn ? option.color : 'transparent'}
            onClick={() => option.value !== isOn && onSwitch(option.value)}
            borderRadius='8px'
            h={isMobile ? '28px' : '20px'}
            whiteSpace='nowrap'
            {...paragraphMedium}
            fontSize={isMobile ? '13px' : 'unset'}
            color={option.value === isOn ? 'white' : 'grey.800'}
            p={'2px 12px 2px 12px'}
            marginInlineStart='0px !important'
            position={isMobile ? 'unset' : 'relative'}
          >
            {option.text}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
