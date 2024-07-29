const express = require('express')
const router = express.Router();
const auth = require("../middlewares/auth")
const {profile} = require("../controllers/userController")

router.get("/profile", auth.required, profile)

module.exports = router