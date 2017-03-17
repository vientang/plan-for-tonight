'use strict'

const store_controller = require('./store_controller.js')

function router(app) {
  app.post("/store", store_controller.findNearestStore)
}

module.exports = router