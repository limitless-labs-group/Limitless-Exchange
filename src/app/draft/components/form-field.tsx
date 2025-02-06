import { Box, FormLabel } from '@chakra-ui/react'
import { FormFieldProps } from '@/types/draft'

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <Box mt={2} w={'full'}>
    <FormLabel mb={1}>
      <strong>{label}</strong>
    </FormLabel>
    {children}
  </Box>
)
