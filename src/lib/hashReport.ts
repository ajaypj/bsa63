import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { FileHash } from './hashFile'
import { formatDateTimeIST } from './time'

export const TOOL_NAME = 'BSA63 Hash Generator'
export const TOOL_VERSION = '0.1.0'

const MARGIN = 40
const LINE = 14
const PAGE: [number, number] = [595, 842]
const HASH_LINE_CHARS = 64

/** Appends hash-report pages to `doc`; used standalone and as the certificate annexure. */
export async function appendHashReport(doc: PDFDocument, files: FileHash[], userAgent: string): Promise<void> {
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const mono = await doc.embedFont(StandardFonts.Courier)
  let page = doc.addPage(PAGE)
  let y = PAGE[1] - MARGIN

  const line = (text: string, opts: { f?: typeof font; size?: number } = {}) => {
    if (y < MARGIN + LINE) {
      page = doc.addPage(PAGE)
      y = PAGE[1] - MARGIN
    }
    page.drawText(text, { x: MARGIN, y, size: opts.size ?? 10, font: opts.f ?? font, color: rgb(0, 0, 0) })
    y -= LINE
  }

  line('HASH REPORT', { f: bold, size: 16 })
  y -= LINE
  line(`Generated: ${formatDateTimeIST(new Date())}`)
  line(`Tool: ${TOOL_NAME} v${TOOL_VERSION} (${import.meta.env.VITE_APP_URL})`)
  line(`Environment: ${userAgent.slice(0, 90)}`)
  line("Computed on the user's device; files were not uploaded.")
  y -= LINE

  files.forEach((f, i) => {
    line(`${i + 1}. ${f.name}`, { f: bold })
    line(`Size: ${f.size} bytes   Type: ${f.type}   Last modified: ${f.lastModified}`)
    line('SHA256:', { f: bold })
    for (let s = 0; s < f.sha256.length; s += HASH_LINE_CHARS) line(`  ${f.sha256.slice(s, s + HASH_LINE_CHARS)}`, { f: mono })
    y -= LINE / 2
  })
  y -= LINE * 2
  line('Signature: ______________________________')
}

export async function buildHashReportPdf(files: FileHash[], userAgent = navigator.userAgent): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  await appendHashReport(doc, files, userAgent)
  return doc.save()
}
