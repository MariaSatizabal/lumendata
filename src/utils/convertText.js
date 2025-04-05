const Papa = require('papaparse')
const ExcelJS = require('exceljs')

async function convertToXLSX(data) {
  const workbook = new ExcelJS.Workbook()

  for (const [service, results] of Object.entries(data)) {
    const worksheet = workbook.addWorksheet(service)

    const formattedResults = expandJSONData(results)

    const headers = Object.keys(formattedResults[0] || {})

    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' },
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    formattedResults.forEach((row, index) => {
      const rowValues = headers.map((header) =>
        row[header] !== undefined && row[header] !== null ? row[header] : '-'
      )
      const excelRow = worksheet.addRow(rowValues)

      excelRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFD6EAF8' : 'FFEBF5FB' },
        }
      })
    })

    worksheet.columns.forEach((column) => {
      let maxLength = 0
      column.eachCell({ includeEmpty: true }, (cell) => {
        let length = cell.value ? cell.value.toString().length : 10
        if (length > maxLength) {
          maxLength = length
          maxLength = maxLength > 2000 ? 200 : maxLength
        }
      })
      column.width = maxLength + 2
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer.toString('base64')
}

function expandJSONData(data) {
  let expandedData = []

  data.forEach((item) => {
    let flatItem = {}
    flattenObject(item, flatItem, '')
    expandedData.push(flatItem)
  })

  return expandedData
}

function flattenObject(obj, result, prefix) {
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      flattenObject(value, result, newKey)
    } else {
      result[newKey] = value !== undefined && value !== null ? value : '-'
    }
  })
}

function decodeText(fileBase64) {
  const decodedText = Buffer.from(fileBase64, 'base64').toString('utf-8')
  return decodedText
    .split('\n')
    .map((ip) => ip.trim())
    .filter((ip) => ip)
}

function convertToCSV(data) {
  data = formatData(data)
  const csv = Papa.unparse(data, { delimiter: ',', quotes: false })
  return Buffer.from(csv, 'utf-8').toString('base64')
}

const data = {
  Servicio1: [
    { Nombre: 'Juan', Edad: 30 },
    { Nombre: 'Ana', Edad: 25 },
  ],
  Servicio2: [
    { Producto: 'Laptop', Precio: 1200 },
    { Producto: 'Mouse', Precio: 25 },
  ],
}

function formatData(data) {
  return data.map((item) => {
    return Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key,
        typeof value === 'object' ? JSON.stringify(value) : value,
      ])
    )
  })
}

module.exports = { convertToCSV, convertToXLSX, decodeText }
