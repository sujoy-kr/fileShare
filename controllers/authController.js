const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const {userValidator} = require("../util/userValidator")

const register = async (req, res) => {
    const {email, password} = req.body
    if (email && password) {
        try {
            await userValidator.validateAsync({email, password})

            const hashedPass = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND, 10))
            await prisma.user.create(
                {
                    data: {email, password: hashedPass}
                }
            )

            res.status(201).json({message: "Registration Successful"})

        } catch (err) {
            // joi error handling
            if (err.details && err.details[0].message) {
                res.status(400).json({message: err.details[0].message});
            } else if (err.code === 'P2002') {
                res.status(400).json({message: "Email already in use"})
            } else {
                console.log(err)
                res.status(500).json({message: "Internal Server Error"})
            }
        }
    } else {
        res.status(400).json({message: "Email or password missing"})
    }
}

const login = async (req, res) => {
    const {email, password} = req.body
    if (email && password) {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            })

            if (user) {
                const checkPass = await bcrypt.compare(password, user.password);
                if (checkPass) {
                    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET)

                    res.status(201).json({token, email: user.email})
                } else {
                    res.status(401).json({message: "Invalid Password"})
                }
            } else {
                res.status(404).json({message: "No User Found With These Credentials"})
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({message: "Email or password missing"})
        }
    } else {
        res.status(400).json({message: "Email or password missing"})
    }
}

module.exports = {register, login}