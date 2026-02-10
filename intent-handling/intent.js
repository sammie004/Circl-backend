const db = require('../connection/connection')

// intent creation
const createIntent = async (req, res) => {
    const { intent_type, description } = req.body
    const user_id = req.user.id
    console.log(`[CREATE INTENT] Request received for user_id: ${user_id} with intent_type: ${intent_type}`)

    // Validate required fields
    if (!intent_type || !description) {
        console.warn(`[CREATE INTENT] Validation failed: missing fields for user_id: ${user_id}`)
        return res.status(400).json({ message: `Intent type and description are required` })
    }

    // Step 1: Fetch the latest active intent for this user
    const checkQuery = `SELECT * FROM intents WHERE user_id = ? AND active = 1 ORDER BY created_at DESC LIMIT 1`
    console.log(`[CREATE INTENT] Fetching latest active intent for user_id: ${user_id}`)

    db.query(checkQuery, [user_id], (err, results) => {
        if (err) {
            console.error(`[CREATE INTENT] Error checking last intent for user_id: ${user_id}`, err)
            return res.status(500).json({ message: `Internal server error` })
        }

        if (results.length > 0) {
            const lastIntent = results[0]
            console.log(`[CREATE INTENT] Last active intent found for user_id: ${user_id} => type: ${lastIntent.intent_type}, created_at: ${lastIntent.created_at}`)
            
            const now = new Date()
            const lastCreated = new Date(lastIntent.created_at)
            const diffMinutes = (now - lastCreated) / 60000 // convert ms → minutes
            console.log(`[CREATE INTENT] Time since last intent: ${diffMinutes.toFixed(2)} minutes`)

            // Step 2a: Check for duplicate intent
            if (lastIntent.intent_type === intent_type) {
                console.warn(`[CREATE INTENT] Duplicate intent type detected for user_id: ${user_id}`)
                return res.status(400).json({ message: `You already have an active intent of this type` })
            }

            // Step 2b: Check for 5-minute cooldown
            if (diffMinutes < 5) {
                console.warn(`[CREATE INTENT] Intent created too recently for user_id: ${user_id}. Must wait ${Math.ceil(5 - diffMinutes)} more minute(s)`)
                return res.status(400).json({ message: `You must wait at least 5 minutes before creating a new intent` })
            }
        } else {
            console.log(`[CREATE INTENT] No active intent found for user_id: ${user_id}, proceeding to create new intent`)
        }

        // Step 3: Deactivate any existing active intent
        const deactivateQuery = `UPDATE intents SET active = 0 WHERE user_id = ? AND active = 1`
        console.log(`[CREATE INTENT] Deactivating any existing active intents for user_id: ${user_id}`)
        db.query(deactivateQuery, [user_id], (err) => {
            if (err) {
                console.error(`[CREATE INTENT] Error deactivating existing intent for user_id: ${user_id}`, err)
                return res.status(500).json({ message: `Internal server error` })
            }
            console.log(`[CREATE INTENT] Previous intents deactivated for user_id: ${user_id}`)

            // Step 4: Insert new active intent
            const insertQuery = `INSERT INTO intents (user_id, intent_type, description, active) VALUES (?, ?, ?, 1)`
            console.log(`[CREATE INTENT] Inserting new intent for user_id: ${user_id}`)
            db.query(insertQuery, [user_id, intent_type, description], (err, results) => {
                if (err) {
                    console.error(`[CREATE INTENT] Error creating new intent for user_id: ${user_id}`, err)
                    return res.status(500).json({ message: `Internal server error` })
                }

                console.log(`[CREATE INTENT] New intent created successfully for user_id: ${user_id} with intent_type: ${intent_type}`)
                return res.status(201).json({ message: `Intent created successfully` })
            })
        })
    })
}

// fetch intents for a user
const GetIntents = async (req, res) => {
    const userId = req.user.id
    console.log(`[GET INTENTS] Fetch request received for user_id: ${userId}`)

    const query = `SELECT * FROM intents WHERE user_id = ? AND active = 1 ORDER BY created_at DESC`
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(`[GET INTENTS] Error fetching intents for user_id: ${userId}`, err)
            return res.status(500).json({ message: `Internal server error` })
        }

        console.log(`[GET INTENTS] Fetched ${results.length} intents for user_id: ${userId}`)
        return res.status(200).json({ message: `Intents fetched successfully`, intents: results })
    })
}

module.exports = { createIntent, GetIntents }
