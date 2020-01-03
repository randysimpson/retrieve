const express = require('express');
const router = express.Router();
const config = require('../model/config');

/* GET home page. */
router.get('/', (req, res) => {
  res.send({
    version: config.version,
    podName: config.podName
  })
});

module.exports = router;
