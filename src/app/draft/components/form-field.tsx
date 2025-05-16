import { Box, FormLabel, Text } from '@chakra-ui/react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { FormFieldProps } from '@/types/draft'

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <Box mt={2} w={'full'}>
    <FormLabel mb={1}>
      <Text {...paragraphMedium}>{label}</Text>
    </FormLabel>
    {children}
  </Box>
)
