const { decodeText, convertToCSV, convertToXLSX } = require('../utils/convertText')
const { ErrorHandler } = require('../utils/errorHandler')
const { execAbuseipdb } = require('./abusepdbController')
const { execMaltiverse } = require('./maltiverseController')
const { execThreatBook } = require('./threatBookController')
const { execVirustotal } = require('./virusTotalController')

exports.exec = async (req, res, next) => {
  const { file, api_keys, format } = req.body
  try {
    const ips = decodeText(file)
    if (ips.length === 0) return next(new ErrorHandler(400, 'El archivo no contiene IPs válidas'))

    const execServices = {
      abuseipdb: execAbuseipdb,
      maltiverse: execMaltiverse,
      threatBook: execThreatBook,
      virustotal: execVirustotal,
    }
    const resultsExecServices = {}
    for (const [service, api_keysArray] of Object.entries(api_keys)) {
      resultsExecServices[service] = await execServices[service]({
        ips,
        api_keys: api_keysArray,
        next,
      })
    }

    let result = {}
    if (format == 'xlsx') {
      result = { xlsx: await convertToXLSX(resultsExecServices).catch(error => console.log(error)) }
    } else {
      for (const [key, value] of Object.entries(resultsExecServices)) {
        result[key] = convertToCSV(value)
      }
    }

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
