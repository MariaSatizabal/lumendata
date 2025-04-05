const { checkIpThreatBookService } = require('../services/threatBookService')

exports.execThreatBook = async (params) => {
  const { ips, api_keys, next } = params
  try {
    let results = await Promise.all(
      ips.map(async (ip) => {
        for (const apiKey of api_keys) {
          try {
            const result = await checkIpThreatBookService(
              {},
              {
                apikey: apiKey,
                resource: ip,
                include: 'summary,ports,cas,basic,asn',
              }
            )
            return result.data
          } catch (error) {
            return { IP: ip, error: error.response.data.msg }
          }
        }
        return []
      })
    )
    if (results.length > 0) {
      results = results.map((result) => {
        return {
          IP: result.IP,
          'Está en lista blanca': result
            ? result.summary?.whitelist
              ? 'Si'
              : 'No'
            : 'Desconocido',
          'Primer reporte': result?.summary?.first_seen || 'Desconocido',
          'Último reporte': result?.summary?.last_seen || 'Desconocido',
          'Proveedor de red': result?.basic?.carrier || 'Desconocido',
          País: result?.basic?.location?.country || 'Desconocido',
          Ciudad: result?.basic?.location?.city || 'Desconocido',
          'Sistema autónomo': result?.asn?.info || 'Desconocido',
          Juicios: result?.summary?.judgments.join(',') || 'No tiene',
          '# de puertos expuestos': result?.ports?.map((p) => p.port).join(',') || 'No tiene',
          'Tipo de puerto': result?.ports?.map((p) => p.module).join(',') || 'No tiene',
          error: result.error || undefined,
        }
      })
    }

    return results
  } catch (error) {
    next(error)
  }
}
