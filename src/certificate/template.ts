// Schedule to the Bharatiya Sakshya Adhiniyam, 2023 [See section 63(4)(c)] — verbatim.
// Single source of truth: do not paraphrase. Gazette copy: docs/legal/bsa-2023-gazette.pdf

export const DEVICE_TYPES = ['Computer / Storage Media', 'DVR', 'Mobile', 'Flash Drive', 'CD/DVD', 'Server', 'Cloud', 'Other'] as const
export const OWNERSHIP = ['Owned', 'Maintained', 'Managed', 'Operated'] as const
export const ALGORITHMS = ['SHA1', 'SHA256', 'MD5', 'Other'] as const

export const PART_A_TITLE = 'PART A'
export const PART_A_SUBTITLE = '(To be filled by the Party)'
export const PART_B_TITLE = 'PART B'
export const PART_B_SUBTITLE = '(To be filled by the Expert)'

export const PART_A_AFFIRM =
  'do hereby solemnly affirm and sincerely state and submit as follows:—'
export const PART_A_PRODUCED =
  'I have produced electronic record/output of the digital record taken from the following device/digital record source (tick mark):—'
export const PART_B_PRODUCED =
  'The produced electronic record/output of the digital record are obtained from the following device/digital record source (tick mark):—'
export const OTHER_LABEL = 'Other:'
export const DEVICE_INFO_TAIL =
  'and any other relevant information, if any, about the device/digital record'
export const LAWFUL_CONTROL =
  'The digital device or the digital record source was under the lawful control for regularly creating, storing or processing information for the purposes of carrying out regular activities and during this period, the computer or the communication device was working properly and the relevant information was regularly fed into the computer during the ordinary course of business. If the computer/digital device at any point of time was not working properly or out of operation, then it has not affected the electronic/digital record or its accuracy. The digital device or the source of the digital record is:—'
export const OWNERSHIP_SUFFIX = 'by me (select as applicable).'
export const HASH_STATEMENT_PREFIX = 'I state that the HASH value/s of the electronic/digital record/s is'
export const HASH_STATEMENT_SUFFIX = 'obtained through the following algorithm:—'
export const ALGORITHM_OTHER_SUFFIX = '(Legally acceptable standard)'
export const HASH_REPORT_NOTE = '(Hash report to be enclosed with the certificate)'
export const SIGNATURE_PARTY = '(Name and signature)'
export const SIGNATURE_EXPERT = '(Name, designation and signature)'
