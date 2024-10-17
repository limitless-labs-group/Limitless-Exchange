import { Box, FormLabel } from '@chakra-ui/react'
import { FormFieldProps } from '@/types/draft'

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <Box mt={4} w={'full'}>
    <FormLabel>
      <strong>{label}</strong>
    </FormLabel>
    {children}
  </Box>
)
