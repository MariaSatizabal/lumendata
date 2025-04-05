const config = require('../../config/config.json')
const { get } = require('../utils/httpRequest')
const service = 'Maltiverse'

exports.checkIpMaltiverseService = async (headers, params) => {
  return get({
    service,
    path: `${config.ipServices.Maltiverse.routes.check}/${params.ipAddress}`,
    headers
  })
}
