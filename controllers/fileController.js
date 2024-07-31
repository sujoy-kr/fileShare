const prisma = require('../config/db')
const jwt = require("jsonwebtoken")
const path = require("path");
const fs = require("fs");

const uploadFile = async (req, res) => {
    try {
        if (req.file && req.body.fileName) {
            const user = req.data
            const userId = parseInt(user.userId)

            const foundUser = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            if (!foundUser) {
                return res.status(404).json({message: "No User Found With This Token"})
            }

            if (!foundUser.emailConfirmed) {
                return res.status(403).json({message: "Confirm Your Email to Upload Files"})
            }

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
            const filePath = path.resolve(file.fileUrl);

            // Delete if the file exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }

            await prisma.file.delete({
                where: {id}
            })

            res.status(200).json({message: "File Deleted"})
        } else {
            res.status(404).json({message: "No File Found With This Id"})
        }
    } catch (err) {
        res.status(400).json({message: "Unexpected Server Error"})
    }
}

module.exports = {
    uploadFile,
    getSharableLink,
    deleteFile
}