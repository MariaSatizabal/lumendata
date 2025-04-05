const express = require('express')
const api = express.Router()
const ipController = require('../controllers/ipController')
const virusTotalController = require('../controllers/virusTotalController')
const { validateBody } = require('../validators/bodyValidator')

api.post('/exec/', [validateBody, ipController.exec])
api.post('/virustotal/quotes', [virusTotalController.quotes])

module.exports = api