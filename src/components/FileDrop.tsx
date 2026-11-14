import { useState } from 'react'

interface Props {
  onFiles: (files: File[]) => void
}

export function FileDrop({ onFiles }: Props) {
  const [over, setOver] = useState(false)
  return (
    <label
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-white p-10 text-center transition ${over ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onFiles(Array.from(e.dataTransfer.files))
      }}
    >
      <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      <span className="font-medium">Drop files here or tap to choose</span>
      <input
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
    </label>
  )
}
