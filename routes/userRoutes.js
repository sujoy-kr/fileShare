const express = require('express')
const router = express.Router();
const auth = require("../middlewares/auth")
const {profile, deleteUser} = require("../controllers/userController")

router.get("/profile", auth.required, profile)
router.delete("/delete", auth.required, deleteUser)

module.exports = router