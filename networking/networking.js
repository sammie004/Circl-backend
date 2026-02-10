const db = require('../connection/connection')

// Send a connection invite
const sendInvite = async (req, res) => {
    const senderId = req.user.id
    const { receiver_id } = req.body

    console.log(`[SEND INVITE] sender_id: ${senderId}, receiver_id: ${receiver_id}`)

    if (!receiver_id) {
        console.warn(`[SEND INVITE] Missing receiver_id for sender_id: ${senderId}`)
        return res.status(400).json({ message: "receiver_id is required" })
    }

    if (receiver_id === senderId) {
        console.warn(`[SEND INVITE] Sender tried to connect with self: ${senderId}`)
        return res.status(400).json({ message: "Cannot send invite to yourself" })
    }

    // Check if connection already exists (pending or accepted)
    const checkQuery = `
        SELECT * FROM connections 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        AND status IN ('pending', 'accepted')
    `
    db.query(checkQuery, [senderId, receiver_id, receiver_id, senderId], (err, results) => {
        if (err) {
            console.error(`[SEND INVITE] Error checking existing connection:`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        if (results.length > 0) {
            console.warn(`[SEND INVITE] Connection already exists between ${senderId} & ${receiver_id}`)
            return res.status(400).json({ message: "Connection already exists or is pending" })
        }

        // Insert new connection
        const insertQuery = `INSERT INTO connections (sender_id, receiver_id) VALUES (?, ?)`
        db.query(insertQuery, [senderId, receiver_id], (err, results) => {
            if (err) {
                console.error(`[SEND INVITE] Error creating connection:`, err)
                return res.status(500).json({ message: "Internal server error" })
            }

            console.log(`[SEND INVITE] Invite sent successfully: ${senderId} → ${receiver_id}`)
            return res.status(201).json({ message: "Invite sent successfully" })
        })
    })
}

// Accept a connection invite
const acceptInvite = async (req, res) => {
    const userId = req.user.id
    const { connection_id } = req.body

    console.log(`[ACCEPT INVITE] user_id: ${userId}, connection_id: ${connection_id}`)

    if (!connection_id) {
        return res.status(400).json({ message: "connection_id is required" })
    }

    const query = `
        UPDATE connections 
        SET status = 'accepted' 
        WHERE id = ? AND receiver_id = ?
    `
    db.query(query, [connection_id, userId], (err, results) => {
        if (err) {
            console.error(`[ACCEPT INVITE] Error accepting invite:`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        if (results.affectedRows === 0) {
            console.warn(`[ACCEPT INVITE] No pending invite found for connection_id: ${connection_id} & user_id: ${userId}`)
            return res.status(404).json({ message: "No pending invite found" })
        }

        console.log(`[ACCEPT INVITE] Invite accepted: connection_id ${connection_id}`)
        return res.status(200).json({ message: "Invite accepted successfully" })
    })
}

// Decline a connection invite
const declineInvite = async (req, res) => {
    const userId = req.user.id
    const { connection_id } = req.body

    console.log(`[DECLINE INVITE] user_id: ${userId}, connection_id: ${connection_id}`)

    if (!connection_id) {
        return res.status(400).json({ message: "connection_id is required" })
    }

    const query = `
        UPDATE connections 
        SET status = 'declined' 
        WHERE id = ? AND receiver_id = ?
    `
    db.query(query, [connection_id, userId], (err, results) => {
        if (err) {
            console.error(`[DECLINE INVITE] Error declining invite:`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        if (results.affectedRows === 0) {
            console.warn(`[DECLINE INVITE] No pending invite found for connection_id: ${connection_id} & user_id: ${userId}`)
            return res.status(404).json({ message: "No pending invite found" })
        }

        console.log(`[DECLINE INVITE] Invite declined: connection_id ${connection_id}`)
        return res.status(200).json({ message: "Invite declined successfully" })
    })
}

// Fetch pending invites
const getPendingInvites = async (req, res) => {
    const userId = req.user.id
    console.log(`[GET PENDING INVITES] Fetching pending invites for user_id: ${userId}`)

    const query = `
        SELECT c.id, c.sender_id, u.email AS sender_email, c.created_at
        FROM connections c
        JOIN users u ON c.sender_id = u.id
        WHERE c.receiver_id = ? AND c.status = 'pending'
        ORDER BY c.created_at DESC
    `
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(`[GET PENDING INVITES] Error fetching invites:`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        console.log(`[GET PENDING INVITES] Found ${results.length} pending invites for user_id: ${userId}`)
        return res.status(200).json({ message: "Pending invites fetched successfully", invites: results })
    })
}

// Fetch accepted connections
const getConnections = async (req, res) => {
    const userId = req.user.id
    console.log(`[GET CONNECTIONS] Fetching accepted connections for user_id: ${userId}`)

    const query = `
        SELECT c.id, c.sender_id, c.receiver_id, u.email AS friend_email
        FROM connections c
        JOIN users u 
        ON (u.id = c.sender_id AND c.receiver_id = ?) 
           OR (u.id = c.receiver_id AND c.sender_id = ?)
        WHERE c.status = 'accepted'
    `
    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error(`[GET CONNECTIONS] Error fetching connections:`, err)
            return res.status(500).json({ message: "Internal server error" })
        }

        console.log(`[GET CONNECTIONS] Found ${results.length} accepted connections for user_id: ${userId}`)
        return res.status(200).json({ message: "Connections fetched successfully", connections: results })
    })
}

module.exports = { sendInvite, acceptInvite, declineInvite, getPendingInvites, getConnections }
