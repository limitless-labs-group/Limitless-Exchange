import * as yup from 'yup'
import { ProfileFields } from '@/components'

export const profileValidationSchema: yup.ObjectSchema<ProfileFields> = yup.object({
  displayName: yup.string().required('Required'),
  username: yup.string().required('Required'),
  bio: yup.string(),
})
