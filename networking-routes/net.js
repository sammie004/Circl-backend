const express = require("express")
const router = express.Router()

// middleware
const protect = require('../middleware/middleware')

// controllers
const { sendInvite, acceptInvite, declineInvite, getPendingInvites, getConnections } = require('../networking/networking')
const{ SentInvites } = require('../networking/sent-invites')

router.post('/invite', protect, sendInvite)
router.post('/accept', protect, acceptInvite)
router.post('/decline', protect, declineInvite)
router.get('/pending', protect, getPendingInvites)
router.get('/sent-invites', protect, SentInvites)
router.get('/connections', protect, getConnections)

module.exports = router