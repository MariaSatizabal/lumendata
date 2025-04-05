const {
  checkIpVirusTotalService,
  checkIpVirusTotalQuotesService,
} = require('../services/virusTotalService')

exports.execVirustotal = async (params) => {
  const { ips, api_keys, next } = params
  try {
    let results = await Promise.all(
      ips.map(async (ip) => {
        for (const apiKey of api_keys) {
          try {
            const result = await checkIpVirusTotalService(
              {
                'x-apikey': apiKey,
              },
              {
                ipAddress: ip,
              }
            )
            return result.data
          } catch (error) {
            return { id: ip, error: error.response.data.error.message }
          }
        }
        return []
      })
    )
    if (results.length > 0) {
      results = results.map((result) => {
        console.log("🚀 ~ results=results.map ~ result:", result)
        let Clasificaciones = []
        if(result.attributes?.last_analysis_results){
          for (const value of Object.values(result.attributes.last_analysis_results)) {
            if (value.category != 'harmless' && value.category != 'undetected')
              Clasificaciones.push(value.result)
          }
          if (!Clasificaciones.length) Clasificaciones.push('harmless')
          Clasificaciones = [...new Set(Clasificaciones)]
        }
        return {
          IP: result.id,
          Link: result?.links?.self || 'Desconocido',
          Maliciosa: result?.attributes?.last_analysis_stats?.malicious || 0,
          Sospechosa: result?.attributes?.last_analysis_stats?.suspicious || 0,
          'Sistema Autonomo': result.attributes?.as_owner || 'Desconocido',
          'Atributos de red': result.attributes?.network || 'Desconocido',
          País: result?.attributes?.country || 'Desconocido',
          Clasificaciones: Clasificaciones.length > 0 ? Clasificaciones.join(',') : 'Ninguna',
          error: result.error || undefined,
        }
      })
    }

    return results
  } catch (error) {
    console.log('🚀 ~ exports.execVirustotal= ~ error:', error)
    next(error)
  }
}

exports.quotes = async (req, res, next) => {
  const { apiKey } = req.body
  const response = await checkIpVirusTotalQuotesService(
    {
      'x-apikey': apiKey,
    },
    {
      apiKey,
    }
  ).catch((error) => ({ status: error.response.status, error: error.response.statusText }))
  console.log('🚀 ~ exports.quotes= ~ response:', response)
  if (response.error) return res.status(response.status).json({ error: response.error })
  return res.status(200).json({
    response: {
      api_requests_hourly: response.data.attributes.quotas.api_requests_hourly,
      api_requests_daily: response.data.attributes.quotas.api_requests_daily,
      api_requests_monthly: response.data.attributes.quotas.api_requests_monthly,
    },
  })
}
