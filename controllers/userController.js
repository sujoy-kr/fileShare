const prisma = require('../config/db')

const profile = async (req, res) => {
    try {
        const userId = parseInt(req.data.userId)

        if (!userId) {
            res.status(400).json({message: "Not a Valid Token"})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {files: true}
        })

        if (!user) {
            res.status(404).json({message: "No User Found"})
        }

        // Filter out the fileUrl from the files
        if (user && user.files) {
            user.files = user.files.map(({fileUrl, ...file}) => file);
        }

        res.status(200).json(user)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Unexpected Server Error"})
    }

}

module.exports = {profile}