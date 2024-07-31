const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        // user app password in gmail
        pass: process.env.NODEMAILER_PASS,
    }
})

const sendConfirmationEmail = async (to, code) => {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to,
        subject: 'Your Confirmation Token',
        text: `Click the link to activate your account: ${process.env.HOST_LINK}/api/auth/confirm/${code}`
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (err) {
        console.log('nodemailer error', err)
    }
}

module.exports = {sendConfirmationEmail}

