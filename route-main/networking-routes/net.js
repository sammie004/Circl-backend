const express = require("express")
const router = express.Router()

// middleware
const protect = require('../../middleware/middleware')

// controllers
const { sendInvite, acceptInvite, declineInvite, getPendingInvites, getConnections } = require('../../networking/networking')
const { SentInvites } = require('../../networking/sent-invites')

/**
 * @swagger
 * /api/networking/invite:
 *   post:
 *     summary: Send a connection invite
 *     tags: [Networking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Invite sent successfully
 *       400:
 *         description: Invalid request or already connected
 *       401:
 *         description: Unauthorized
 */
router.post('/invite', protect, sendInvite)


/**
 * @swagger
 * /api/networking/accept:
 *   post:
 *     summary: Accept a connection invite
 *     tags: [Networking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connection_id:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       200:
 *         description: Invite accepted successfully
 *       404:
 *         description: Invite not found
 *       401:
 *         description: Unauthorized
 */
router.post('/accept', protect, acceptInvite)


/**
 * @swagger
 * /api/networking/decline:
 *   post:
 *     summary: Decline a connection invite
 *     tags: [Networking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connection_id:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       200:
 *         description: Invite declined successfully
 *       404:
 *         description: Invite not found
 *       401:
 *         description: Unauthorized
 */
router.post('/decline', protect, declineInvite)


/**
 * @swagger
 * /api/networking/pending:
 *   get:
 *     summary: Get all pending connection invites received by the user
 *     tags: [Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending invites fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/pending', protect, getPendingInvites)


/**
 * @swagger
 * /api/networking/sent-invites:
 *   get:
 *     summary: Get all invites sent by the user
 *     tags: [Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sent invites fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/sent-invites', protect, SentInvites)


/**
 * @swagger
 * /api/networking/connections:
 *   get:
 *     summary: Get all accepted connections for the user
 *     tags: [Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Connections fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/connections', protect, getConnections)

module.exports = router
