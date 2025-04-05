class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

const handleError = (err, res) => {
  console.error(err.stack)

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    const value = err.keyValue[field]
    return res.status(409).json({
      status: 'error',
      statusCode: 409,
      message: `El valor '${value}' ya existe para el campo '${field}'.`,
    })
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message)
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: messages.join(', '),
    })
  }

  const { statusCode = 500, message = 'Error interno del servidor' } = err
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  })
}

module.exports = {
  ErrorHandler,
  handleError,
}
