'use client'

import React, { useState } from 'react'
import * as XLSX from 'xlsx'

export default function ExcelToPdfClient() {
  const [labels, setLabels] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Hàm chuyển đổi ngày từ Excel sang định dạng Việt Nam
  function excelDateToJSDate(serial: any) {
    if (!serial) return ''
    const utc_days = Math.floor(serial - 25569)
    const utc_value = utc_days * 86400
    const date_info = new Date(utc_value * 1000)
    return date_info.toLocaleDateString('vi-VN')
  }

  // Bước 1: Đọc file Excel ngay tại trình duyệt
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setIsProcessing(true)
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    
    // Sửa lỗi: Lấy chính xác tên của tab đầu tiên trong file Excel
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // Chuyển đổi dữ liệu sang dạng mảng JSON
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true })
    
    console.log("Dữ liệu đọc được từ Excel:", rows) // Mẹo: Bạn có thể nhấn F12 trên trình duyệt để kiểm tra dòng này
    
    if (rows.length === 0) {
      alert("File Excel này không có dữ liệu!")
    } else {
      setLabels(rows) // Chỉ khi có dữ liệu thì nút Tải PDF mới hiển thị
    }
  } catch (error) {
    console.error("Lỗi đọc file Excel:", error)
    alert("Không thể đọc được file Excel này. Vui lòng kiểm tra lại!")
  } finally {
    setIsProcessing(false)
  }
}


  // Bước 2: Kích hoạt thư viện sinh file PDF trực tiếp ở Client
  const generatePDF = async () => {
    // Chỉ import thư viện này ở Client để tránh lỗi Next.js SSR
    const html2pdf = (await import('html2pdf.js')).default
    
    const element = document.getElementById('pdf-content')
    if (!element) return

    const options = {
      margin: 0,
      filename: 'labels.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm'as const, format: 'a4' as const, orientation: 'portrait'as const }
    }

    // Chạy lệnh tải file trực tiếp về máy người dùng
    html2pdf().set(options).from(element).save()
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Ứng dụng chuyển đổi Excel sang Nhãn PDF (Client-side)</h2>
      
      {/* Nút chọn file */}
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      
      {/* Nút bấm Tạo và Tải PDF */}
      {labels.length > 0 && (
        <button 
          onClick={generatePDF} 
          style={{ margin: '10px', padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Tải file PDF về máy
        </button>
      )}

      {isProcessing && <p>Đang xử lý dữ liệu...</p>}

      {/* VÙNG HIỂN THỊ HTML ĐỂ IN RA PDF (Ẩn hoặc hiện tùy bạn, ở đây để hiện để xem thử) */}
      <div id="pdf-content" style={{ width: '210mm', background: '#fff', margin: '20px auto', color: '#000' }}>
        {labels.map((label, index) => {
          // Xử lý nhóm 2 nhãn thành 1 trang A4 như logic cũ của bạn
          if (index % 2 !== 0) return null
          const nextLabel = labels[index + 1]

          return (
            <div key={index} className="page" style={{ width: '210mm', minHeight: '297mm', padding: '5mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pageBreakAfter: 'always' }}>
              {/* Nhãn 1 */}
              <div className="label" style={{ width: '100%', height: '128mm', border: '1.2mm solid #000', borderRadius: '4mm', padding: '5mm', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', fontSize: '12mm', fontWeight: 'bold' }}>GOOD LABEL</div>
                <div style={{ textAlign: 'center', fontSize: '16mm', fontWeight: 'bold' }}>SKU: {label['Item Code'] || ''}</div>
                <div style={{ textAlign: 'center', fontSize: '8mm', fontWeight: 'bold' }}>{label['Item Name'] || ''}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7mm', marginTop: 'auto' }}>
                  <tbody>
                    <tr><td style={{ width: '45mm', fontWeight: 'bold' }}>QTY:</td><td style={{ fontWeight: 'bold' }}>{label['Quantity'] || ''}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>BATCH NO:</td><td style={{ fontWeight: 'bold' }}>{label['BatchNO'] || ''}</td></tr>
                    <tr><td style={{ fontWeight: 'bold' }}>MFG DATE:</td><td style={{ fontWeight: 'bold' }}>{excelDateToJSDate(label['Production date'])}</td></tr>
                  </tbody>
                </table>
                <div style={{ textAlign: 'center', fontSize: '6.5mm', marginTop: '6mm' }}>
                  RCV DATE: {excelDateToJSDate(label['Receiving date'])} {label['Cont'] ? ` - Cont: ${label['Cont']}` : ''}
                </div>
              </div>

              <div style={{ borderTop: '0.6mm dashed #000', margin: '5mm 0' }}></div>

              {/* Nhãn 2 (Nếu có) */}
              {nextLabel ? (
                <div className="label" style={{ width: '100%', height: '128mm', border: '1.2mm solid #000', borderRadius: '4mm', padding: '5mm', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ textAlign: 'center', fontSize: '12mm', fontWeight: 'bold' }}>GOOD LABEL</div>
                  <div style={{ textAlign: 'center', fontSize: '16mm', fontWeight: 'bold' }}>SKU: {nextLabel['Item Code'] || ''}</div>
                  <div style={{ textAlign: 'center', fontSize: '8mm', fontWeight: 'bold' }}>{nextLabel['Item Name'] || ''}</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7mm', marginTop: 'auto' }}>
                    <tbody>
                      <tr><td style={{ width: '45mm', fontWeight: 'bold' }}>QTY:</td><td style={{ fontWeight: 'bold' }}>{nextLabel['Quantity'] || ''}</td></tr>
                      <tr><td style={{ fontWeight: 'bold' }}>BATCH NO:</td><td style={{ fontWeight: 'bold' }}>{nextLabel['BatchNO'] || ''}</td></tr>
                      <tr><td style={{ fontWeight: 'bold' }}>MFG DATE:</td><td style={{ fontWeight: 'bold' }}>{excelDateToJSDate(nextLabel['Production date'])}</td></tr>
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'center', fontSize: '6.5mm', marginTop: '6mm' }}>
                    RCV DATE: {excelDateToJSDate(nextLabel['Receiving date'])} {nextLabel['Cont'] ? ` - Cont: ${nextLabel['Cont']}` : ''}
                  </div>
                </div>
              ) : (
                <div style={{ height: '128mm' }}></div> // Khung trống giữ dáng A4
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
