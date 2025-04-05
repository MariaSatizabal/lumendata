const { checkIpMaltiverseService } = require('../services/maltiverseService')

exports.execMaltiverse = async (params) => {
  const { ips, api_keys, next } = params
  try {
    let results = await Promise.all(
      ips.map(async (ip) => {
        for (const apiKey of api_keys) {
          try {
            const result = await checkIpMaltiverseService(
              { Authorization: `bearer ${apiKey}` },
              { ipAddress: ip }
            )
            return result
          } catch (error) {
            return { ip_addr: ip, error: error.response.data.message }
          }
        }
        return []
      })
    )
    
    // console.log("🚀 ~ exports.execMaltiverse= ~ results:", results)

    if (results.length > 0) {
      results = results.map((result) => {
        const listasNegras = result.blacklist ? result.blacklist.map((item) => item.source) : []
        const uniqueListasNegras = [...new Set(listasNegras)].join(',')
        return {
          IP: result.ip_addr,
          'Sistema Autónomo': result.as_name || 'Desconocido',
          País: result.asn_country_code || 'Desconocido',
          Ciudad: result.city || 'Desconocido',
          Clasificación: result.classification,
          '# de Listas negras': result.blacklist ? result.blacklist.length : 0,
          'Listas negras': uniqueListasNegras.length > 0
            ? uniqueListasNegras
            : 'Ninguna',
          error: result.error || undefined,
        }
      })
    }

    return results
  } catch (error) {
    next(error)
  }
}
