import { useCallback, useEffect, useRef, useState } from 'react'

const TOAST_MS = 3000

export function useToast() {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback((text: string) => {
    clearTimeout(timer.current)
    setMessage(text)
    timer.current = setTimeout(() => setMessage(''), TOAST_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const toast = message && (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm text-white shadow-lg"
    >
      {message}
    </div>
  )
  return { show, toast }
}
