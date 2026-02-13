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


// =======================
// DELETE PROFILE
// =======================
const deleteProfile = async (req, res) => {
    const user_id = req.user.id

    const checkUserExists = `select * from users where id =?`
    db.query(checkUserExists, [user_id], (err, results) => {
        if (err) {
            console.error(`[SERVER ERROR] internal server error `, err)
            return res.status(500).json({ message: "Internal server error" })
        }
        if (results.length === 0) {
            console.warn(`[DELETE PROFILE] User not found for user_id: ${user_id}`)
            return res.status(404).json({ message: "User not found" })
        } else {
            const deleteProfileQuery = `delete from profiles where user_id = ?`
            db.query(deleteProfileQuery, [user_id], (err) => {
                if (err) {
                    console.error(`[DELETE PROFILE] Failed to delete profile`, err)
                    return res.status(500).json({ message: "Internal server error" })
                }
                console.log(`[DELETE PROFILE] Profile deleted successfully for user_id: ${user_id}`)
                return res.status(200).json({ message: "Profile deleted successfully" })
            
            })
        }

    })
}

// ======================
// CHANGE PASSWORD
// ====================
const changePassword = async (req, res) => {
    const { userId } = req.user
    const { password } = req.body

    if (!password) {
        return res.status(400).json({ message: "Password is required!" })
    } else {
        const check = `select * from users where id =?`
        db.query(check, [userId], async (err, results) => {
            if (err) {
                console.error('[CHANGE_PASSWORD] DB error while checking user existence:', err)
                return res.status(500).json({ message: `Internal server error` })
            } else if (results.length === 0) {
                console.log('[CHANGE_PASSWORD] No user found with ID:', userId)
                return res.status(404).json({ message: "User not found" })
            }
            
            const users = results[0]
            const match = await bcrypt.compare(password, users.password)
            if (match) {
                console.log('[CHANGE_PASSWORD] New password cannot be the same as the old password for user ID:', userId)
                return res.status(400).json({ message: "New password cannot be the same as the old password" })
            }
        
            try {
                const hashedPassword = await bcrypt.hash(password, 10)
                const updateQuery = `
                UPDATE users
                SET password = ?
                WHERE id = ?
            `
                db.query(updateQuery, [hashedPassword, userId], (err) => {
                    if (err) {
                        console.error('[CHANGE_PASSWORD] Error updating password:', err)
                        return res.status(500).json({ message: "Failed to change password" })
                    }
                    console.log('[CHANGE_PASSWORD] Password changed successfully for user ID:', userId)
                    return res.json({ message: "Password changed successfully" })
                })
            } catch (error) {
                console.error('[CHANGE_PASSWORD] Error hashing password:', error)
                return res.status(500).json({ message: "Failed to change password" })
            }
        
        })
    }
}


module.exports = { CreateProfile, GetProfile, deleteProfile,changePassword }
