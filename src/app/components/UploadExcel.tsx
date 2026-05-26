'use client'

import { useState } from 'react'
import { generateLabels } from '../actions/generateLabels'

export default function UploadExcel() {
  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    try {
      setLoading(true)

      const formData = new FormData(
        e.currentTarget
      )

      // =========================
      // SERVER ACTION
      // =========================

      const base64 =
        await generateLabels(formData)

      // =========================
      // BASE64 → BINARY
      // =========================

      const byteCharacters =
        atob(base64)

      const byteNumbers =
        new Array(byteCharacters.length)

      for (
        let i = 0;
        i < byteCharacters.length;
        i++
      ) {
        byteNumbers[i] =
          byteCharacters.charCodeAt(i)
      }

      const byteArray =
        new Uint8Array(byteNumbers)

      // =========================
      // CREATE PDF BLOB
      // =========================

      const blob = new Blob(
        [byteArray],
        {
          type: 'application/pdf',
        }
      )

      // =========================
      // DOWNLOAD FILE
      // =========================

      const url =
        URL.createObjectURL(blob)

      const a =
        document.createElement('a')

      a.href = url

      a.download =
        'warehouse-label.pdf'

      document.body.appendChild(a)

      a.click()

      a.remove()

      URL.revokeObjectURL(url)

    } catch (error) {

      console.error(error)

      alert('Generate PDF failed')

    } finally {

      setLoading(false)

    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="file"
        name="file"
        accept=".xlsx,.xls"
        required
      />

      <button
        type="submit"
        className="
          bg-blue-500
          text-white
          px-4
          py-2
          rounded
        "
      >
        {loading
          ? 'Generating PDF...'
          : 'Generate PDF'}
      </button>
    </form>
  )
}