import * as yup from 'yup'

export interface ProfileFields {
  displayName: string
  username: string
  bio?: string
}

export const profileValidationSchema: yup.ObjectSchema<ProfileFields> = yup.object({
  displayName: yup.string().required('Required'),
  username: yup.string().required('Required'),
  bio: yup.string(),
})
