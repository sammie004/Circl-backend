const db = require('../connection/connection')

// create or update user's intent
const selectIntent = (req, res) => {
    const { intent_type, description } = req.body
    const user_id = req.user.id // from authentication middleware

    if (!intent_type) {
        console.log('[INTENT] Validation failed: intent_type missing')
        return res.status(400).json({ message: "Intent type is required" })
    }

    // deactivate any existing active intent
    const deactivateQuery = `UPDATE intents SET is_active = 0 WHERE user_id = ? AND is_active = 1`
    db.query(deactivateQuery, [user_id], (err) => {
        if (err) {
            console.error('[INTENT] Failed to deactivate previous intents:', err)
            return res.status(500).json({ message: "Server error" })
        }

        // insert new active intent
        const insertQuery = `INSERT INTO intents (user_id, intent_type, description, is_active) VALUES (?, ?, ?, 1)`
        db.query(insertQuery, [user_id, intent_type, description], (err, results) => {
            if (err) {
                console.error('[INTENT] Failed to insert new intent:', err)
                return res.status(500).json({ message: "Server error" })
            }
            console.log('[INTENT] Intent created successfully:', { user_id, intent_type })
            return res.status(201).json({ message: "Intent selected successfully" })
        })
    })
}

module.exports = { selectIntent }
