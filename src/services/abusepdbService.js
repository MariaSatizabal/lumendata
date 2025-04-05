const config = require('../../config/config.json')
const { get } = require('../utils/httpRequest')
const service = 'AbuseIPDB'

exports.checkIpAbusepdbService = async (headers, params) => {
  return get({
    service,
    path: `${config.ipServices.AbuseIPDB.routes.check}`,
    headers,
    params,
  })
}
