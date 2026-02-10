const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded   // 🔥 THIS IS CRITICAL
        next()
    } catch (err) {
        return res.status(401).json({ message: "Oops! it looks like your token has expired \n Login again to get a new one generated for you" })
    }
}

module.exports = auth
