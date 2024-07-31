const prisma = require('../config/db')
const path = require("path");
const fs = require("fs");

const profile = async (req, res) => {
    try {
        const userId = parseInt(req.data.userId)

        if (!userId) {
            return res.status(400).json({message: "Not a Valid Token"})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {files: true}
        })

        if (!user) {
            return res.status(404).json({message: "No User Found"})
        }

        // Filter out the fileUrl from the files
        if (user && user.files) {
            user.files = user.files.map(({fileUrl, ...file}) => file);
        }

        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: "Unexpected Server Error"})
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.data.userId)

        if (!userId) {
            return res.status(400).json({message: "Not a Valid Token"})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {files: true}
        })

        if (!user) {
            return res.status(404).json({message: "No User Found"})
        }

        // Filter out the fileUrl from the files
        // Delete files if any
        if (user.files.length > 0) {
            // Collect file deletion promises
            const fileDeletions = user.files.map(async (file) => {
                const filePath = path.resolve(file.fileUrl);
                // Delete file from filesystem
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                // Delete file record from database
                await prisma.file.delete({
                    where: {id: file.id}
                });
            });

            // Wait for all file deletions to complete
            await Promise.all(fileDeletions);
        }

        await prisma.user.delete({
            where: {id: userId}
        })

        res.status(200).json({message: "User and Their Corresponding Files Deleted Successfully"})
    } catch (err) {
        res.status(500).json({message: "Unexpected Server Error"})
    }
}


module.exports = {profile, deleteUser}