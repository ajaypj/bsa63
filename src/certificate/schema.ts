import { z } from 'zod'
import { ALGORITHMS, DEVICE_TYPES, OWNERSHIP } from './template'

const text = z.string().trim()
const REQUIRED = 'Required'

export const deviceSchema = z.object({
  types: z.array(z.enum(DEVICE_TYPES)).min(1, 'Select at least one'),
  otherType: text,
  makeModel: text,
  color: text,
  serialNumber: text,
  deviceId: text, // IMEI/UIN/UID/MAC/Cloud ID, as applicable
  otherInfo: text,
})

const partFields = {
  device: deviceSchema,
  algorithms: z.array(z.enum(ALGORITHMS)).min(1, 'Select at least one'),
  otherAlgorithm: text,
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use DD/MM/YYYY'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm (24 hour)'),
  place: text.min(1, REQUIRED),
}

export const partASchema = z.object({
  name: text.min(1, REQUIRED),
  relation: text, // son/daughter/spouse of
  residence: text.min(1, REQUIRED),
  ownership: z.array(z.enum(OWNERSHIP)).min(1, 'Select at least one'),
  ...partFields,
})

export const partBSchema = z.object({
  name: text,
  relation: text,
  residence: text,
  ...partFields,
})

export const caseSchema = z.object({
  court: text,
  caseNumber: text,
  parties: text,
  exhibitNumber: text,
})

function requireOther(
  value: { device: z.infer<typeof deviceSchema>; algorithms: string[]; otherAlgorithm: string },
  ctx: z.RefinementCtx,
) {
  if (value.device.types.includes('Other') && !value.device.otherType) {
    ctx.addIssue({ code: 'custom', path: ['device', 'otherType'], message: 'Specify the other device type' })
  }
  if (value.algorithms.includes('Other') && !value.otherAlgorithm) {
    ctx.addIssue({ code: 'custom', path: ['otherAlgorithm'], message: 'Specify the other algorithm' })
  }
}

export const partAValidated = partASchema.superRefine(requireOther)
export const partBValidated = partBSchema.superRefine(requireOther)

export type PartA = z.infer<typeof partASchema>
export type PartB = z.infer<typeof partBSchema>
export type CaseDetails = z.infer<typeof caseSchema>
