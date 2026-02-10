// dependencies installation
const db = require('../connection/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

// user registration
const register = async (req, res) => {
    const { email, password } = req.body
    console.log('[REGISTER] Incoming request', { email }) // log incoming request

    if (!email || !password) {
        console.log('[REGISTER] Validation failed: email or password missing')
        return res.status(400).json({ message: `Those fields can't be left empty` })
    }

    // check if user already exists
    const check = `SELECT * FROM users WHERE email = ?`
    db.query(check, [email], async (err, results) => {
        if (err) {
            console.error('[REGISTER] DB error while checking user existence:', err)
            return res.status(500).json({ message: `Internal server error` })
        }

        if (results.length > 0) {
            console.log('[REGISTER] User already exists:', email)
            return res.status(409).json({ message: `Oops! This user already exists` })
        } else {
            console.log('[REGISTER] No existing user found, hashing password')
            try {
                const salt_rounds = 10
                const hashed_password = await bcrypt.hash(password, salt_rounds)
                console.log('[REGISTER] Password hashed successfully')

                // insert user into database
                const insert = `INSERT INTO users (email, password) VALUES (?, ?)`
                db.query(insert, [email, hashed_password], (err, results) => {
                    if (err) {
                        console.error('[REGISTER] DB error while inserting user:', err)
                        return res.status(500).json({ message: `Internal server error` })
                    }
                    console.log('[REGISTER] User registered successfully:', email)
                    return res.status(201).json({ message: `User registered successfully` })
                })
            } catch (error) {
                console.error('[REGISTER] Error hashing password:', error)
                return res.status(500).json({ message: 'Internal server error' })
            }
        }
    })
}

// user login
const login = (req, res) => {
    const { email, password } = req.body
    console.log('[LOGIN] Incoming request', { email })

    if (!email || !password) {
        console.log('[LOGIN] Validation failed: email or password missing')
        return res.status(400).json({ message: "Email and password are required!" })
    }

    const login_query = `SELECT * FROM users WHERE email = ?`
    db.query(login_query, [email], async (err, results) => {
        if (err) {
            console.error('[LOGIN] DB error while fetching user:', err)
            return res.status(500).json({ message: "Server error" })
        }

        const user = results[0]
        if (!user) {
            console.log('[LOGIN] No user found with email:', email)
            return res.status(401).json({ message: "Invalid credentials" })
        }

        // Check if account is locked
        if (user.isLocked) {
            const now = new Date()
            console.log('[LOGIN] Account is locked. Checking lock status:', { locked_until: user.locked_until })

            if (user.locked_until && new Date(user.locked_until) <= now) {
                // Unlock account
                const unlockQuery = `
                    UPDATE users
                    SET failed_login_attempts = 0,
                        isLocked = 0,
                        locked_until = NULL
                    WHERE email = ?
                `
                db.query(unlockQuery, [email], (err) => {
                    if (err) console.error('[LOGIN] Failed to auto-unlock user:', err)
                    else console.log('[LOGIN] Account auto-unlocked:', email)
                })
                user.isLocked = 0
                user.failed_login_attempts = 0
                user.locked_until = null
            } else {
                const remaining = Math.ceil((new Date(user.locked_until) - now) / 60000)
                console.log('[LOGIN] Account still locked, remaining minutes:', remaining)
                return res.status(403).json({
                    message: `Account temporarily locked. Try again in ${remaining} minute(s).`
                })
            }
        }

        // Check password
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            let attempts = user.failed_login_attempts + 1
            let isLocked = 0
            let locked_until = null

            if (attempts >= 5) {
                isLocked = 1
                locked_until = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
                console.log('[LOGIN] Account locked due to too many failed attempts:', email)
            } else {
                console.log('[LOGIN] Password mismatch, incrementing failed attempts:', attempts)
            }

            const updateQuery = `
                UPDATE users
                SET failed_login_attempts = ?, isLocked = ?, locked_until = ?
                WHERE email = ?
            `
            db.query(updateQuery, [attempts, isLocked, locked_until, email], (err) => {
                if (err) console.error('[LOGIN] Failed to update failed login attempts:', err)
            })

            return res.status(401).json({ message: "Invalid credentials" })
        }

        // Successful login → reset failed attempts
        const resetQuery = `
            UPDATE users
            SET failed_login_attempts = 0,
                isLocked = 0,
                locked_until = NULL
            WHERE email = ?
        `
        db.query(resetQuery, [email], (err) => {
            if (err) console.error('[LOGIN] Failed to reset login attempts:', err)
            else console.log('[LOGIN] Failed attempts reset for user:', email)
        })

        const token = jwt.sign({ email: user.email, 
            id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        console.log('[LOGIN] Login successful:', { email: user.email, token })
        return res.json({
            message: "Login successful",
            token,
            email: user.email,
            onboarded: user.onboarded
        })
    })
}

module.exports = { register, login }
