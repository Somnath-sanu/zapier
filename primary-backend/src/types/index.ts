import {string, z} from "zod"

export const SignupSchema = z.object({
  username: z.string().email(),
  password: z.string().min(4),
  name: z.string().min(3)
})

export const SigninSchema = z.object({
  username: z.string().email(),
  password: z.string()
})

export const ZapCreateSchema = z.object({
  availableTriggerId: z.string(),
  triggerMetada: z.any().optional(),
  actions: z.array(z.object({
    availableActionId: z.string(),
    actionMetadata: z.any().optional()
  }))


})