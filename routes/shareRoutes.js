const express = require('express')
const router = express.Router();
const {share} = require("../controllers/shareController")

router.get('/:token', share);

module.exports = router