import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { partAValidated, type PartA } from '../certificate/schema'
import { newDocumentId, renderCertificatePdf } from '../certificate/renderPdf'
import { ALGORITHMS, DEVICE_TYPES, OWNERSHIP } from '../certificate/template'
import { download } from '../lib/download'
import type { FileHash } from '../lib/hashFile'
import { formatDateIST, formatTimeIST } from '../lib/time'

const input = 'field mt-1'

function Text({ label, name, register, error }: { label: string; name: string; register: UseFormRegister<PartA>; error?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input className={input} {...register(name as never)} />
      {error && <span className="text-red-700">{error}</span>}
    </label>
  )
}

function Checks({ label, name, options, register, error }: { label: string; name: string; options: readonly string[]; register: UseFormRegister<PartA>; error?: string }) {
  return (
    <fieldset className="text-sm">
      <legend className="font-medium">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <label key={o}>
            <input type="checkbox" value={o} {...register(name as never)} /> {o}
          </label>
        ))}
      </div>
      {error && <span className="text-red-700">{error}</span>}
    </fieldset>
  )
}

export function CertificateWizard({ files }: { files: FileHash[] }) {
  const [caseDetails, setCaseDetails] = useState({ court: '', caseNumber: '', parties: '', exhibitNumber: '' })
  const now = new Date()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartA>({
    resolver: zodResolver(partAValidated),
    defaultValues: {
      device: { types: [], otherType: '', makeModel: '', color: '', serialNumber: '', deviceId: '', otherInfo: '' },
      ownership: [],
      algorithms: ['SHA256'],
      otherAlgorithm: '',
      date: formatDateIST(now),
      time: formatTimeIST(now),
      name: '',
      relation: '',
      residence: '',
      place: '',
    },
  })

  if (files.length === 0) return <p>Hash at least one file on the Hash tab first.</p>

  const submit = handleSubmit(async (partA) => {
    const pdf = await renderCertificatePdf({ docId: newDocumentId(), caseDetails, partA, partB: null, files, userAgent: navigator.userAgent })
    download(pdf, 'section-63-certificate.pdf', 'application/pdf')
  })

  return (
    <form onSubmit={submit} className="card space-y-4">
      <p className="text-sm text-slate-600">{files.length} file(s) will be listed with their hashes. Part B is printed blank for the expert to complete.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(['court', 'caseNumber', 'parties', 'exhibitNumber'] as const).map((k) => (
          <label key={k} className="block text-sm">
            {k}
            <input className={input} value={caseDetails[k]} onChange={(e) => setCaseDetails({ ...caseDetails, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <h2 className="font-semibold">Part A</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Text label="Name" name="name" register={register} error={errors.name?.message} />
        <Text label="Son/daughter/spouse of" name="relation" register={register} />
        <Text label="Residing/employed at" name="residence" register={register} error={errors.residence?.message} />
        <Text label="Place" name="place" register={register} error={errors.place?.message} />
        <Text label="Date (DD/MM/YYYY)" name="date" register={register} error={errors.date?.message} />
        <Text label="Time (IST, HH:mm)" name="time" register={register} error={errors.time?.message} />
      </div>
      <Checks label="Device / source" name="device.types" options={DEVICE_TYPES} register={register} error={errors.device?.types?.message} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Text label="Other (device type)" name="device.otherType" register={register} error={errors.device?.otherType?.message} />
        <Text label="Make & Model" name="device.makeModel" register={register} />
        <Text label="Color" name="device.color" register={register} />
        <Text label="Serial Number" name="device.serialNumber" register={register} />
        <Text label="IMEI/UIN/UID/MAC/Cloud ID" name="device.deviceId" register={register} />
        <Text label="Other relevant information" name="device.otherInfo" register={register} />
      </div>
      <Checks label="The device or source is (by me)" name="ownership" options={OWNERSHIP} register={register} error={errors.ownership?.message} />
      <Checks label="Hash algorithm" name="algorithms" options={ALGORITHMS} register={register} error={errors.algorithms?.message} />
      <Text label="Other algorithm" name="otherAlgorithm" register={register} error={errors.otherAlgorithm?.message} />
      <button className="btn-primary">Download certificate PDF</button>
    </form>
  )
}
