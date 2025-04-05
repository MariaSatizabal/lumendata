const { checkIpAbusepdbService } = require('../services/abusepdbService')

exports.execAbuseipdb = async (params) => {
  const { ips, api_keys, next } = params
  try {
    let results = await Promise.all(
      ips.map(async (ip) => {
        for (const apiKey of api_keys) {
          try {
            const result = await checkIpAbusepdbService({ Key: apiKey }, { ipAddress: ip })
            return result.data
          } catch (error) {
            return { ipAddress: ip, error: error.response.data.errors[0].detail }
          }
        }
        return []
      })
    )

    if (results.length > 0) {
      results = results.map((result) => {
        return {
          IP: result.ipAddress,
          Tipo: result ? (result.isPublic ? 'Pública' : 'Privada') : 'Desconocido',
          País: result?.asn_country_code || 'Desconocido',
          'Está en lista blanca': result ? (result.isWhitelisted ? 'Si' : 'No') : 'Desconocido',
          'Confianza de abuso (%)': result?.abuseConfidenceScore || 0,
          País: result?.countryCode || 'Desconocido',
          'Tipo de uso': result?.usageType || 'Desconocido',
          ISP: result?.isp || 'Desconocido',
          'Dominio asociado': result?.domain || 'Desconocido',
          'Es nodo de Tor': result ? (result.isTor ? 'Si' : 'No') : 'Desconocido',
          '# de reportes': result?.totalReports || 0,
          '# fuentes que reportaron': result?.numDistinctUsers || 0,
          'Fecha ultimo reporte': result?.lastReportedAt || 'No tiene',
          error: result.error || undefined,
        }
      })
    }

    return results
  } catch (error) {
    next(error)
  }
}
