const Joi = require('joi')

const bodyGeneralSchema = Joi.object({
  file: Joi.string().required().messages({
    'string.empty': 'El archivo es obligatorio en formato BASE64',
    'any.required': 'El archivo es obligatorio en formato BASE64',
  }),
  api_keys: Joi.object().required().messages({
    'any.required': 'El campo "api_keys" es obligatorio',
  }),
  format: Joi.string().valid('csv', 'xlsx').required().messages({
    'string.empty': 'El formato es obligatorio',
    'any.required': 'El formato es obligatorio',
    'any.only': 'El formato debe ser "csv" o "xlsx"',
  })
})

exports.validateBody = (req, res, next) => {
  const { error } = bodyGeneralSchema.validate({ ...req.body }, { abortEarly: false })

  if (error) {
    const errors = error.details.map((detail) => ({
      message: detail.message,
      field: detail.context.key,
    }))
    return res.status(400).json({ errors })
  }

  next()
}
