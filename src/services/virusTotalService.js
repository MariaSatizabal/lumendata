const config = require('../../config/config.json')
const { get } = require('../utils/httpRequest')
const service = 'VirusTotal'

exports.checkIpVirusTotalService = async (headers, params) => {
  return get({
    service,
    path: `${config.ipServices.VirusTotal.routes.check}/${params.ipAddress}`,
    headers,
    params
  })
}

exports.checkIpVirusTotalQuotesService = async (headers, params) => {
  return get({
    service,
    path: `${config.ipServices.VirusTotal.routes.quotes}/${params.apiKey}`,
    headers,
    params
  })
}