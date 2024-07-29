// multer middleware
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    },
})

const upload = multer({storage: storage})

// a single file can be uploaded with the name 'file'
const multerMiddleware = upload.single('file')

module.exports = {multerMiddleware}