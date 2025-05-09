import { Button, ButtonGroup, HStack, Text, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { useThemeProvider } from '@/providers'
import ThemeIcon from '@/resources/icons/theme-icon.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function ThemeSwitcher() {
  const { setLightTheme, setDarkTheme, mode } = useThemeProvider()
  const { toggleColorMode } = useColorMode()
  const { trackClicked } = useAmplitude()

  const themeOptions = [
    {
      type: 'light',
      text: 'Light',
      analytic: 'Light On',
      func: () => {
        toggleColorMode()
        setLightTheme()
      },
    },
    {
      type: 'dark',
      text: 'Dark',
      analytic: 'Dark On',
      func: () => {
        toggleColorMode()
        setDarkTheme()
      },
    },
  ]

  return (
    <HStack w='full' justifyContent='space-between' px='8px'>
      <HStack gap='4px'>
        <ThemeIcon />
        <Text {...paragraphMedium}>Theme</Text>
      </HStack>
      <ButtonGroup variant='outline' gap='2px' p='2px' bg='grey.100' borderRadius='8px'>
        {themeOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            bg={mode === option.type ? 'grey.50' : 'grey.100'}
            onClick={() => {
              trackClicked(ClickEvent.UIModeClicked, {
                mode: option.type,
              })
              option.func()
            }}
            _hover={{ bg: mode === option.type ? 'grey.50' : 'grey.200' }}
            borderRadius='8px'
            h={isMobile ? '28px' : '20px'}
            whiteSpace='nowrap'
            {...paragraphMedium}
            fontSize={isMobile ? '13px' : 'unset'}
            color={'grey.800'}
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
