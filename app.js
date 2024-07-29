const express = require('express')
const bodyParser = require('body-parser')

const authRoutes = require("./routes/authRoutes")
const fileRoutes = require("./routes/fileRoutes")
const shareRoutes = require("./routes/shareRoutes")

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/auth', authRoutes)
app.use('/api/file', fileRoutes)
app.use('/share', shareRoutes)

app.use((req, res) => {
    res.status(404).json({message: "Page Not Found."})
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})