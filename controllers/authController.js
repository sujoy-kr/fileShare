const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../config/db')

const {userValidator} = require("../util/userValidator")
const {sendConfirmationEmail} = require("../util/mailService")
const {redisClient} = require("../config/redis");
const path = require("path");
const fs = require("fs");

const register = async (req, res) => {
    const {email, password} = req.body
    if (email && password) {
        try {
            await userValidator.validateAsync({email, password})

            const hashedPass = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND, 10))
            const user = await prisma.user.create(
                {
                    data: {email, password: hashedPass}
                }
            )

            const confirmationToken = jwt.sign({userId: user.id}, process.env.JWT_SECRET)

            await sendConfirmationEmail(email, confirmationToken)
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    confirmationToken
                },
            })

            res.status(201).json({message: "Registration Successful. Please Check Your Email to Activate Your Account."})

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

const confirm = async (req, res) => {
    try {
        const token = req.params.token

        if (!token) {
            return res.status(400).json({message: 'No token provided'});
        }

        const data = jwt.verify(token, process.env.JWT_SECRET)

        if (!data.userId) {
            return res.status(404).json({message: 'Not a Valid Token'});
        }

        const user = await prisma.user.findUnique({
            where: {
                id: data.userId
            }
        })

        if (!user) {
            return res.status(404).json({message: 'Invalid Confirmation Token'});
        }

        if (user.emailConfirmed && !user.confirmationToken) {
            return res.status(400).json({message: 'Account Already Verified'});
        }

        if (token !== user.confirmationToken) {
            return res.status(400).json({message: 'Invalid Confirmation Token'});
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                emailConfirmed: true,
                confirmationToken: null
            },
        })

        return res.status(200).json({message: 'Email successfully verified!'});
    } catch (err) {
        console.log(err)
        if (err.name === 'TokenExpiredError') {
            // Handle expired token
            return res.status(400).json({message: 'Expired link'});
        }

        res.status(500).json({message: "Unexpected Server Error"})
    }
}

module.exports = {register, login, confirm}