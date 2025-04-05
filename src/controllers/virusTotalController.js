const {
  checkIpVirusTotalService,
  checkIpVirusTotalQuotesService,
} = require('../services/virusTotalService')

exports.execVirustotal = async (params) => {
  const { ips, api_keys, next } = params
  try {
    let error = false
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
            console.warn(`⚠️ Error con API Key ${apiKey}, intentando con la siguiente...`)
            console.warn('🚀 ~ ips.map ~ error:', error.message)
          }
        }
        error = true
        return []
      })
    )
    console.log('🚀 ~ exports.execVirustotal= ~ results:', results)
    if (results.length > 0 && !error) {
      results = results.map((result) => {
        let Clasificaciones = []
        console.log('🚀 ~ results=results.map ~ result:', result)
        for (const value of Object.values(result.attributes.last_analysis_results)) {
          if (value.category != 'harmless' && value.category != 'undetected')
            Clasificaciones.push(value.result)
        }
        if (!Clasificaciones.length) Clasificaciones.push('harmless')
        return {
          IP: result.id,
          Link: result.links.self || '',
          Maliciosa: result.attributes.last_analysis_stats?.malicious || 0,
          Sospechosa: result.attributes.last_analysis_stats?.suspicious || 0,
          'Sistema Autonomo': result.attributes?.as_owner || 'Desconocido',
          'Atributos de red': result.attributes?.network || 'Desconocido',
          País: result.attributes.country || 'Desconocido',
          Clasificaciones: Clasificaciones.join(','),
        }
      })
    } else {
      results.push({
        Advertencia:
          'Hay apiKeys invalidas o se agotaron las consultas máximas para tus apiKeys de VirusTotal',
      })
      results = results.flat()
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
