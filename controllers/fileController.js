const prisma = require('../config/db')
const jwt = require("jsonwebtoken")
const path = require("path");
const fs = require("fs");
const {redisClient} = require("../config/redis");

const uploadFile = async (req, res) => {
    try {
        if (req.file && req.body.fileName) {
            console.log(req.data)
            const user = req.data
            const userId = parseInt(user.userId)
            console.log(userId)
            const fileName = req.body.fileName
            const fileUrl = req.file.path

            const file = await prisma.file.create({
                data: {
                    userId, fileName, fileUrl
                }
            })

            if (file) {
                res.status(201).json({message: "File Uploaded"})

            }
        } else {
            res.status(400).json({message: "Either File or File Name Missing"})
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message})
    }
}

const getSharableLink = async (req, res) => {
    try {
        let {id} = req.params
        id = parseInt(id)

        const file = await prisma.file.findUnique({
            where: {
                id
            }
        })

        if (file) {
            const token = jwt.sign({fileId: file.id}, process.env.JWT_SECRET, {expiresIn: '1w'})
            const sharableLink = process.env.HOST_LINK + '/share/' + token;
            res.status(201).json({sharableLink})

        } else {
            res.status(404).json({message: "No File Found With This Id"})
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({message: "Unexpected Server Error"})
    }
}

const deleteFile = async (req, res) => {
    try {
        let {id} = req.params
        id = parseInt(id)

        const file = await prisma.file.findUnique({
            where: {
                id
            }
        })

        if (file) {
            console.log('file found')
            const filePath = path.resolve(file.fileUrl);
            await prisma.file.delete({
                where: {id}
            })

            console.log('file deleted')

            // Delete if the file exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }

            res.status(200).json({message: "File Deleted"})
        } else {
            res.status(404).json({message: "No File Found With This Id"})
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({message: "Unexpected Server Error"})
    }
}

module.exports = {
    uploadFile,
    getSharableLink,
    deleteFile
}