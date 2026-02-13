const express = require("express")
const router = express.Router()

// controllers
const { createIntent, GetIntents } = require("../../intent-handling/intent")

// middleware
const protect = require("../../middleware/middleware")

/**
 * @swagger
 * /api/intent/create-intent:
 *   post:
 *     summary: Create a new intent for the logged-in user
 *     tags: [Intent]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intent_type:
 *                 type: string
 *                 example: Study Group
 *               description:
 *                 type: string
 *                 example: Looking for backend developers to collaborate
 *     responses:
 *       201:
 *         description: Intent created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create-intent", protect, createIntent)


/**
 * @swagger
 * /api/intent/get-intents:
 *   get:
 *     summary: Get all intents for the logged-in user
 *     tags: [Intent]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Intents fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/get-intents", protect, GetIntents)

module.exports = router
