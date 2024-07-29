const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs")
const prisma = require('../config/db')

const share = async (req, res) => {
    try {
        const token = req.params.token

        if (!token) {
            return res.status(400).json({message: 'No token provided'});
        }

        const data = jwt.verify(token, process.env.JWT_SECRET)
        if (data.fileId) {
            const file = await prisma.file.findUnique({
                where: {
                    id: data.fileId
                }
            })

            if (file) {
                const filePath = path.resolve(file.fileUrl);

                // Check if the file exists
                if (fs.existsSync(filePath)) {
                    // Send the file for download
                    res.status(200).download(filePath);
                } else {
                    // Handle case where the file does not exist on the server
                    res.status(404).json({message: 'File Not Found On The Server'});
                }
            } else {
                res.status(404).json({message: "File Not Found"})
            }
        } else {
            res.status(404).json({message: "Not a Valid Token"})

        }
    } catch (err) {
        console.log(err)
        if (err.name === 'TokenExpiredError') {
            // Handle expired token
            return res.status(400).json({message: 'Expired link'});
        }

        res.status(500).json({message: "Unexpected Server Error"})
    }

}

module.exports = {share}