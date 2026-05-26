import UploadExcel from './components/UploadExcel'

export default function HomePage() {
  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Excel Label Generator
      </h1>

      <UploadExcel />
    </main>
  )
}