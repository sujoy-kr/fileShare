const express = require('express')
const router = express.Router();
const {share} = require("../controllers/shareController")
const {limiter} = require("../middlewares/limiter")

// router.get('/:token', limiter, share); // route using limiter
router.get('/:token', share);

module.exports = router