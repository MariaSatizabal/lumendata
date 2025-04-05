const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const { handleError } = require('./utils/errorHandler')
const app = express()
const cors = require('cors')
app.use(cors())
app.set('port', process.env.PORT || 5000)
app.use(helmet.hidePoweredBy())
app.use(bodyParser.json({ limit: '10mb' }))

app.use(
  morgan((tokens, req, res) => {
    return `\n[${new Date().toUTCString()}] ${tokens.method(req, res)} ${tokens.url(
      req,
      res
    )} ${tokens.status(req, res)} (${tokens['response-time'](req, res)} ms)
----------------------------------------------------------------------`
  })
)

app.use('/api/v1/ip', require('./routes/ip-v1-routes'))

app.use((err, req, res, next) => {
  handleError(err, res)
})

module.exports = app
