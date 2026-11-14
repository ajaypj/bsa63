import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { FileHash } from '../lib/hashFile'
import { appendHashReport } from '../lib/hashReport'
import { formatDateIST } from '../lib/time'
import type { CaseDetails, PartA, PartB } from './schema'
import * as T from './template'

const PAGE: [number, number] = [595, 842]
const MARGIN = 50
const WIDTH = PAGE[0] - MARGIN * 2
const SIZE = 10.5
const LEADING = 15
const BOX = 9
const BLANK = '______________'
const DOC_ID_RANDOM_LENGTH = 8

export function newDocumentId(now = new Date()): string {
  const ymd = formatDateIST(now).split('/').reverse().join('')
  const rand = crypto.randomUUID().replaceAll('-', '').slice(0, DOC_ID_RANDOM_LENGTH).toUpperCase()
  return `BSA63-${ymd}-${rand}`
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word
    if (current && font.widthOfTextAtSize(next, size) > width) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

class Writer {
  page: PDFPage
  y = PAGE[1] - MARGIN
  private doc: PDFDocument
  private font: PDFFont
  private bold: PDFFont
  constructor(doc: PDFDocument, font: PDFFont, bold: PDFFont) {
    this.doc = doc
    this.font = font
    this.bold = bold
    this.page = doc.addPage(PAGE)
  }

  newPage() {
    this.page = this.doc.addPage(PAGE)
    this.y = PAGE[1] - MARGIN
  }

  gap(n = LEADING / 2) {
    this.y -= n
  }

  private ensure(h: number) {
    if (this.y - h < MARGIN + 20) this.newPage()
  }

  para(text: string, opts: { bold?: boolean; size?: number; center?: boolean; indent?: number } = {}) {
    const font = opts.bold ? this.bold : this.font
    const size = opts.size ?? SIZE
    const indent = opts.indent ?? 0
    for (const line of wrap(text, font, size, WIDTH - indent)) {
      this.ensure(LEADING)
      const x = opts.center ? (PAGE[0] - font.widthOfTextAtSize(line, size)) / 2 : MARGIN + indent
      this.page.drawText(line, { x, y: this.y, size, font, color: rgb(0, 0, 0) })
      this.y -= LEADING
    }
  }

  /** Tick-box row, wrapping to a new line when it overflows. */
  ticks(options: readonly string[], selected: string[], suffix = '') {
    let x = MARGIN
    this.ensure(LEADING)
    for (const opt of options) {
      const w = BOX + 4 + this.font.widthOfTextAtSize(opt, SIZE) + 14
      if (x + w > MARGIN + WIDTH) {
        x = MARGIN
        this.y -= LEADING
        this.ensure(LEADING)
      }
      this.page.drawRectangle({ x, y: this.y - 1, width: BOX, height: BOX, borderWidth: 0.8, borderColor: rgb(0, 0, 0) })
      if (selected.includes(opt)) {
        this.page.drawLine({ start: { x: x + 1.5, y: this.y + 3 }, end: { x: x + 4, y: this.y + 0.5 }, thickness: 1.2 })
        this.page.drawLine({ start: { x: x + 4, y: this.y + 0.5 }, end: { x: x + BOX - 1, y: this.y + BOX - 2 }, thickness: 1.2 })
      }
      this.page.drawText(opt, { x: x + BOX + 4, y: this.y, size: SIZE, font: this.font })
      x += w
    }
    if (suffix) this.page.drawText(suffix, { x, y: this.y, size: SIZE, font: this.font })
    this.y -= LEADING
  }
}

const v = (s: string | undefined) => (s && s.length > 0 ? s : BLANK)

function deviceBlock(w: Writer, d: PartA['device'] | undefined) {
  w.ticks(T.DEVICE_TYPES, d?.types ?? [])
  w.para(`${T.OTHER_LABEL} ${v(d?.otherType)}`)
  w.para(`Make & Model: ${v(d?.makeModel)}   Color: ${v(d?.color)}`)
  w.para(`Serial Number: ${v(d?.serialNumber)}`)
  w.para(`IMEI/UIN/UID/MAC/Cloud ID ${v(d?.deviceId)} (as applicable)`)
  w.para(`${T.DEVICE_INFO_TAIL} ${v(d?.otherInfo)} (specify).`)
}

function hashBlock(w: Writer, p: PartA | PartB | null, files: FileHash[]) {
  w.para(`${T.HASH_STATEMENT_PREFIX} ${files.length === 0 ? BLANK : 'as listed below,'} ${T.HASH_STATEMENT_SUFFIX}`)
  for (const f of files) {
    w.para(`${f.name}`, { bold: true, indent: 12 })
    for (const [a, h] of Object.entries(f.hashes)) w.para(`${a.toUpperCase()}: ${h}`, { indent: 24, size: 9 })
  }
  const label = (a: string) => (a === 'Other' ? a : `${a}:`)
  w.ticks(T.ALGORITHMS.map(label), (p?.algorithms ?? []).map(label))
  w.para(`Other ${v(p?.otherAlgorithm)} ${T.ALGORITHM_OTHER_SUFFIX}`)
  w.para(T.HASH_REPORT_NOTE)
}

function signatureBlock(w: Writer, label: string, p: PartA | PartB | null) {
  w.gap(LEADING * 2)
  w.para(`${BLANK}${BLANK}   ${label}`, { indent: 220 })
  if (p?.name) w.para(p.name, { indent: 220 })
  w.para(`Date (DD/MM/YYYY): ${v(p?.date)}`)
  w.para(`Time (IST): ${v(p?.time)} hours (In 24 hours format)`)
  w.para(`Place: ${v(p?.place)}`)
}

function partA(w: Writer, a: PartA, files: FileHash[]) {
  w.newPage()
  w.para(T.PART_A_TITLE, { bold: true, size: 14, center: true })
  w.para(T.PART_A_SUBTITLE, { center: true })
  w.gap()
  w.para(`I, ${v(a.name)} (Name), Son/daughter/spouse of ${v(a.relation)} residing/employed at ${v(a.residence)} ${T.PART_A_AFFIRM}`)
  w.para(T.PART_A_PRODUCED)
  deviceBlock(w, a.device)
  w.para(T.LAWFUL_CONTROL)
  w.ticks(T.OWNERSHIP, a.ownership, T.OWNERSHIP_SUFFIX)
  hashBlock(w, a, files)
  signatureBlock(w, T.SIGNATURE_PARTY, a)
}

function partB(w: Writer, b: PartB | null, files: FileHash[]) {
  w.newPage()
  w.para(T.PART_B_TITLE, { bold: true, size: 14, center: true })
  w.para(T.PART_B_SUBTITLE, { center: true })
  w.gap()
  w.para(`I, ${v(b?.name)} (Name), Son/daughter/spouse of ${v(b?.relation)} residing/employed at ${v(b?.residence)} ${T.PART_A_AFFIRM}`)
  w.para(T.PART_B_PRODUCED)
  deviceBlock(w, b?.device)
  hashBlock(w, b, files)
  signatureBlock(w, T.SIGNATURE_EXPERT, b)
}

function cover(w: Writer, docId: string, c: CaseDetails, files: FileHash[]) {
  w.para('Electronic Evidence Record', { bold: true, size: 18, center: true })
  w.para('Certificate under Section 63(4), Bharatiya Sakshya Adhiniyam, 2023', { center: true })
  w.gap(LEADING * 2)
  w.para(`Document ID: ${docId}`, { bold: true })
  w.para(`Court: ${v(c.court)}`)
  w.para(`Case number: ${v(c.caseNumber)}`)
  w.para(`Parties: ${v(c.parties)}`)
  w.para(`Exhibit number: ${v(c.exhibitNumber)}`)
  w.para(`Generated: ${formatDateIST(new Date())} (IST)   Engine: client-side, no upload`)
  w.gap()
  w.para('Files covered', { bold: true })
  for (const f of files) {
    w.para(`${f.name} (${f.size} bytes)`, { indent: 12 })
    const sha = f.hashes.sha256
    if (sha) w.para(`SHA256: ${sha.match(/.{1,4}/g)?.join(' ')}`, { indent: 24, size: 9 })
  }
  w.gap()
  w.para('Any change to a file will change its hash value.', { size: 9 })
}

export interface CertificateInput {
  docId: string
  caseDetails: CaseDetails
  partA: PartA
  partB: PartB | null
  files: FileHash[]
  userAgent?: string
}

export async function renderCertificatePdf(input: CertificateInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const w = new Writer(doc, font, bold)
  cover(w, input.docId, input.caseDetails, input.files)
  partA(w, input.partA, input.files)
  partB(w, input.partB, input.files)
  await appendHashReport(doc, input.files, input.userAgent ?? 'unknown')

  const pages = doc.getPages()
  pages.forEach((p, i) => {
    p.drawText(`${input.docId}  |  Section 63 BSA  |  Page ${i + 1} of ${pages.length}`, {
      x: MARGIN,
      y: 25,
      size: 8,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
  })
  return doc.save()
}
