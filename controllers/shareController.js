const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs")
const prisma = require('../config/db')

const {redisClient} = require("../config/redis")
redisClient.connect()

const REDIS_EXP = 86400; // 1 day in secs

const share = async (req, res) => {
    try {
        const token = req.params.token

        // logs the user ip and agent
        // console.log(`IP Address: ${req.ip}, User Agent: ${req.get('User-Agent')}`);

        if (!token) {
            return res.status(400).json({message: 'No token provided'});
        }

        const cachedFilePath = await redisClient.get(token);
        if (cachedFilePath) {
            res.status(200).download(cachedFilePath);
        } else {
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
                        await redisClient.setEx(token, REDIS_EXP, filePath);
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
        }

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // Handle expired token
            return res.status(400).json({message: 'Expired link'});
        }

        res.status(500).json({message: "Unexpected Server Error"})
    }
}

module.exports = {share}