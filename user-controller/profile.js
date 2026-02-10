const db = require('../connection/connection')

// =======================
// CREATE PROFILE
// =======================
const CreateProfile = async (req, res) => {
    const { full_name, faculty, level, interests, bio } = req.body
    const user_id = req.user.id

    console.log(`[CREATE PROFILE] Request received for user_id: ${user_id}`)

    if (!full_name || !faculty || !level || !interests || !bio) {
        console.warn(`[CREATE PROFILE] Validation failed for user_id: ${user_id}`)
        return res.status(400).json({ message: "Those fields can't be left empty" })
    }

    // Check if profile already exists
    const check = `SELECT * FROM profiles WHERE user_id = ?`
    db.query(check, [user_id], (err, results) => {
        if (err) {
            console.error(`[CREATE PROFILE] DB error while checking profile`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        if (results.length > 0) {
            console.warn(`[CREATE PROFILE] Profile already exists for user_id: ${user_id}`)
            return res.status(409).json({ message: "Profile already exists" })
        }

        console.log(`[CREATE PROFILE] No existing profile found, creating profile...`)

        // Insert profile
        const insert = `
            INSERT INTO profiles 
            (user_id, full_name, faculty, level, interests, bio)
            VALUES (?, ?, ?, ?, ?, ?)
        `
        db.query(insert, [user_id, full_name, faculty, level, interests, bio], (err) => {
            if (err) {
                console.error(`[CREATE PROFILE] Failed to insert profile`, err)
                return res.status(500).json({ message: "Internal server error" })
            }

            console.log(`[CREATE PROFILE] Profile created successfully for user_id: ${user_id}`)

            // Update onboarded flag
            const updateUser = `
                UPDATE users
                SET onboarded = 1
                WHERE id = ?
            `
            db.query(updateUser, [user_id], (err) => {
                if (err) {
                    console.error(`[CREATE PROFILE] Failed to update onboarding status`, err)
                    return res.status(500).json({
                        message: "Failed to update onboarding status"
                    })
                }

                console.log(`[CREATE PROFILE] Onboarding completed for user_id: ${user_id}`)

                return res.status(201).json({
                    message: "Profile created successfully",
                    onboarded: 1
                })
            })
        })
    })
}

// =======================
// FETCH PROFILE
// =======================
const GetProfile = async (req, res) => {
    const user_id = req.user.id
    console.log(`[GET PROFILE] Fetching profile for user_id: ${user_id}`)

    const query = `
        SELECT u.email, p.full_name, p.faculty, p.level, p.interests, p.bio
        FROM users u
        JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ?
    `

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(`[GET PROFILE] DB error`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        if (results.length === 0) {
            console.warn(`[GET PROFILE] No profile found for user_id: ${user_id}`)
            return res.status(404).json({ message: "Profile not found" })
        }

        console.log(`[GET PROFILE] Profile fetched successfully for user_id: ${user_id}`)
        return res.json(results[0])
    })
}

module.exports = { CreateProfile, GetProfile }
