const {rateLimit} = require("express-rate-limit")

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, /*next*/) => {
        res.status(429).json({
            message: 'Too many requests from this IP, please try again after 10 minutes',
        });
    },
})

module.exports = {limiter}