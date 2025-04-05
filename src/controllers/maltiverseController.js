const { checkIpMaltiverseService } = require('../services/maltiverseService')

exports.execMaltiverse = async (params) => {
  const { ips, api_keys, next } = params
  try {
    let error = false
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
            console.log('🚀 ~ ips.map ~ error:', error)
            console.warn(`⚠️ Error con API Key ${apiKey}, intentando con la siguiente...`)
          }
        }
        error = true
        return []
      })
    )
    console.log("🚀 ~ exports.execMaltiverse= ~ results:", results)

    if (results.length > 0 && !error) {
      results = results.map((result) => {
        return {
          IP: result.ip_addr,
          'Sistema Autónomo': result.as_name || 'Desconocido',
          País: result.asn_country_code || 'Desconocido',
          Ciudad: result.city || 'Desconocido',
          Clasificación: result.classification,
          '# de Listas negras': result.blacklist ? result.blacklist.length : 0,
          'Listas negras': result.blacklist
            ? result.blacklist.map((blacklist) => blacklist.source).join(',')
            : ['Ninguna'],
        }
      })
    } else {
      results.push({
        Advertencia:
          'Hay apiKeys invalidas o se agotaron las consultas máximas para tus apiKeys de Maltiverse',
      })
      results = results.flat()
    }

    return results
  } catch (error) {
    next(error)
  }
}
