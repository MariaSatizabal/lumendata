const { checkIpAbusepdbService } = require('../services/abusepdbService')

exports.execAbuseipdb = async (params) => {
  try {
    const { ips, api_keys, next } = params

    let error = false
    let results = await Promise.all(
      ips.map(async (ip) => {
        for (const apiKey of api_keys) {
          try {
            const result = await checkIpAbusepdbService({ Key: apiKey }, { ipAddress: ip })
            return result.data
          } catch (error) {
            console.warn(`⚠️ Error con API Key ${apiKey}, intentando con la siguiente...`)
          }
        }
        error = true
        return []
      })
    )

    console.log('🚀 results checkIpAbusepdbService:', results)
    if (results.length > 0 && !error) {
      results = results.map((result) => {
        return {
          IP: result.ipAddress,
          Tipo: result.isPublic ? 'Pública': 'Privada',
          País: result.asn_country_code || 'Desconocido',
          'Está en lista blanca': result.isWhitelisted ? 'Si' : 'No',
          'Confianza de abuso (%)': result.abuseConfidenceScore || 0,
          País: result.countryCode || 'Desconocido',
          'Tipo de uso': result.usageType || 'Desconocido',
          'ISP': result.isp || 'Desconocido',
          'Dominio asociado': result.domain || 'Desconocido',
          'Es nodo de Tor': result.isTor ? 'Si' : 'No',
          '# de reportes': result.totalReports || 0,
          '# fuentes que reportaron': result.numDistinctUsers || 0,
          'Fecha ultimo reporte': result.lastReportedAt || 'No tiene',
        }
      })
    } else {
      results.push({
        Advertencia:
          'Hay apiKeys invalidas o se agotaron las consultas máximas para tus apiKeys de AbuseIpDB',
      })
      results = results.flat()
    }

    return results
  } catch (error) {
    next(error)
  }
}
