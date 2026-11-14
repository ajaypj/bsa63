const IST = 'Asia/Kolkata'

function parts(date: Date, opts: Intl.DateTimeFormatOptions) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: IST, ...opts })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )
}

/** DD/MM/YYYY in IST */
export function formatDateIST(date: Date): string {
  const p = parts(date, { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${p.day}/${p.month}/${p.year}`
}

/** HH:mm in IST, 24-hour */
export function formatTimeIST(date: Date): string {
  const p = parts(date, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return `${p.hour}:${p.minute}`
}

export function formatDateTimeIST(date: Date): string {
  return `${formatDateIST(date)} ${formatTimeIST(date)} IST`
}
