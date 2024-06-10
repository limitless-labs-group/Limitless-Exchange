import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { radioAnatomy } from '@chakra-ui/anatomy';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(radioAnatomy.keys);

const baseStyle = definePartsStyle({
  label: {
    marginInlineStart: '8px',
  },
  control: {
    borderRadius: '12px',
    borderColor: 'black',

    _checked: {
      background: 'black!',
      borderColor: 'black!',
      '&:focus-visible': {
        boxShadow: 'unset!',
      },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'unset!',
      },
    },
    _focusVisible: {
      outline: 'none',
      boxShadow: 'unset!',
    },
  },
});

export const radioTheme = defineMultiStyleConfig({ baseStyle });
