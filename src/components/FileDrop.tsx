import { useState } from 'react'

interface Props {
  onFiles: (files: File[]) => void
}

export function FileDrop({ onFiles }: Props) {
  const [over, setOver] = useState(false)
  return (
    <label
      className={`block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center ${over ? 'border-slate-800 bg-slate-100' : 'border-slate-300'}`}
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
      <span>Drop files here or tap to choose</span>
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
