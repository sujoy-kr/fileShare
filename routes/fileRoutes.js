const express = require('express')
const router = express.Router();
const auth = require("../middlewares/auth")
const {multerMiddleware} = require("../middlewares/multer")
const {uploadFile, getSharableLink, deleteFile} = require("../controllers/fileController")

router.post('/', auth.required, multerMiddleware, uploadFile)
router.get('/:id/get-link', auth.required, getSharableLink)
router.delete('/:id', auth.required, deleteFile)

module.exports = router