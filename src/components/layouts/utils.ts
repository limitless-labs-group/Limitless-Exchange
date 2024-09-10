import * as z from 'zod'

export interface ProfileFields {
  displayName: string
  username: string
  bio: string
}

export const profileValidationSchema = z.object({
  displayName: z.string().min(1, { message: 'Required' }),
  username: z.string().min(2, { message: 'Required' }),
  bio: z.string().min(2, { message: 'Required' }),
})
