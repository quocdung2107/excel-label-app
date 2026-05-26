'use server'

import * as XLSX from 'xlsx'
import puppeteer from 'puppeteer'

function excelDateToJSDate(serial: any) {
  if (!serial) return ''

  const utc_days = Math.floor(serial - 25569)
  const utc_value = utc_days * 86400

  const date_info = new Date(
    utc_value * 1000
  )

  return date_info.toLocaleDateString(
    'vi-VN'
  )
}

function createLabelHTML(label: any) {
  return `
  <div class=\"label\">

    <div class=\"title\">
      GOOD LABEL
    </div>

    <div class=\"item-code\">
      SKU:
      ${label['Item Code'] || ''}
    </div>

    <div class=\"item-name\">
      ${label['Item Name'] || ''}
    </div>

    <table class=\"table\">
      <tr>
        <td>QTY:</td>

        <td>
          ${label['Quantity'] || ''}
        </td>
      </tr>

      <tr>
        <td>BATCH NO:</td>

        <td>
          ${label['BatchNO'] || ''}
        </td>
      </tr>

      <tr>
        <td>MFG DATE:</td>

        <td>
          ${excelDateToJSDate(
            label['Production date']
          )}
        </td>
      </tr>
    </table>

    <div class=\"item-cont\">

      RCV DATE:

      ${excelDateToJSDate(
        label['Receiving date']
      )}

      ${
        label['Cont']
          ? ` - Cont: ${label['Cont']}`
          : ''
      }

    </div>

  </div>
  `
}

export async function generateLabels(
  formData: FormData
) {
  const file = formData.get(
    'file'
  ) as File

  if (!file) {
    throw new Error('No file uploaded')
  }

  const bytes = await file.arrayBuffer()

  const buffer = Buffer.from(bytes)

  const workbook = XLSX.read(buffer, {
    type: 'buffer',
  })

  const worksheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ]

  const rows: any[] =
    XLSX.utils.sheet_to_json(
      worksheet,
      {
        raw: true,
      }
    )

  const safeRows = JSON.parse(
    JSON.stringify(rows)
  )

  let labelsHTML = ''

  for (
    let i = 0;
    i < safeRows.length;
    i += 2
  ) {
    const label1 = createLabelHTML(
      safeRows[i]
    )

    const label2 = safeRows[i + 1]
      ? createLabelHTML(
          safeRows[i + 1]
        )
      : ''

    labelsHTML += `
      <div class=\"page\">

        ${label1}

        <div class=\"cut-line\"></div>

        ${label2}

      </div>
    `
  }

  const html = `
<!DOCTYPE html>
<html>

<head>

<meta charset=\"UTF-8\" />

<style>

@page {
    size: A4;
    margin: 0;
}

*{
    box-sizing:border-box;
}

html,
body{
    margin:0;
    padding:0;

    font-family:Arial,sans-serif;
}

.page{

    width:210mm;
    min-height:297mm;

    padding:5mm;

    display:flex;
    flex-direction:column;
    justify-content:space-between;

    page-break-after:always;
}

.label{

    width:100%;
    height:128mm;

    border:1.2mm solid #000;
    border-radius:4mm;

    padding:5mm;

    display:flex;
    flex-direction:column;
}

.title{

    text-align:center;

    font-size:12mm;
    font-weight:700;

    margin-bottom:5mm;
}

.item-code{

    text-align:center;

    font-size:16mm;
    font-weight:700;

    margin-bottom:7mm;
}

.item-name{

    text-align:center;

    font-size:8mm;
    font-weight:700;

    margin-bottom:8mm;
}

.table{

    width:100%;

    border-collapse:collapse;

    font-size:7mm;

    margin-top:auto;
}

.table td{
    padding:3mm 0;
}

.table td:first-child{

    width:45mm;

    font-weight:700;
}

.table td:last-child{
    font-weight:700;
}

.item-cont{

    text-align:center;

    font-size:6.5mm;

    margin-top:6mm;
}

.cut-line{

    border-top:0.6mm dashed #000;

    margin:5mm 0;
}

</style>

</head>

<body>

${labelsHTML}

</body>

</html>
`

  // =========================
  // PUPPETEER
  // =========================

  const browser =
    await puppeteer.launch({
      headless: true,

      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    })

  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'load',
  })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  })

  await browser.close()

return Buffer.from(pdfBuffer).toString(
  'base64'
)
}