const axios = require('axios')
const config = require('../../config/config.json')
const { ErrorHandler } = require('./errorHandler')
const allowedServices = [...Object.keys(config.ipServices)]

exports.post = async (params) => {
  let { service, path, headers, requestBody } = params

  if (!allowedServices.includes(service)) throw new ErrorHandler(422, 'Servicio invalido')

  return axios
    .post(`${config.ipServices[service].url}${path}`, requestBody, {
      headers: getHeaders(headers),
    })
    .then((response) => {
      console.log("🚀 ~ .then ~ response:", response)
      return response.data
    })
}

exports.get = async (params) => {
  let { service, path, headers, params: paramsData } = params

  if (!allowedServices.includes(service)) throw new ErrorHandler(422, 'Servicio invalido')

  return axios
    .get(`${config.ipServices[service].url}${path}`, {
      headers: getHeaders(headers),
      params: paramsData,
    })
    .then((response) => response.data)
}

const getHeaders = (headers) => ({
  'content-type': 'application/json',
  accept: 'application/json',
  ...headers,
})
