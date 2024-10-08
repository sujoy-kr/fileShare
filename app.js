const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet');
const cors = require('cors')
const morgan = require("morgan");
const env = require('dotenv')
// routes
const authRoutes = require("./routes/authRoutes")
const fileRoutes = require("./routes/fileRoutes")
const shareRoutes = require("./routes/shareRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()
const port = process.env.PORT || 3000

env.config();
app.use(helmet());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors())

// app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/file', fileRoutes)
app.use('/api/user', userRoutes)
app.use('/share', shareRoutes)

app.use((req, res) => {
    res.status(404).json({message: "Page Not Found"})
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})