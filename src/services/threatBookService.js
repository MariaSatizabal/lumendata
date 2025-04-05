const config = require('../../config/config.json')
const { get } = require('../utils/httpRequest')
const service = 'ThreatBook'

exports.checkIpThreatBookService = async (headers, params) => {
  return get({
    service,
    path: `${config.ipServices.ThreatBook.routes.check}`,
    headers,
    params
  })
}