const express = require('express')
const router = express.Router();
const {register, login, confirm} = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.get('/confirm/:token', confirm)

module.exports = router