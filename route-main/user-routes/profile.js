const express = require("express")
const router = express.Router()

const { CreateProfile, GetProfile, deleteProfile, changePassword } = require("../../user-controller/profile")
const protect = require("../../middleware/middleware")

/**
 * @swagger
 * /api/profile/create-profile:
 *   post:
 *     summary: Create or update a user profile
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Samuel Johnson
 *               faculty:
 *                 type: string
 *                 example: Science
 *               level:
 *                 type: string
 *                 example: 300
 *               interests:
 *                 type: string
 *                 example: Backend development, AI
 *               bio:
 *                 type: string
 *                 example: Passionate about building scalable systems
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create-profile", protect, CreateProfile)


/**
 * @swagger
 * /api/profile/get-profile:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/get-profile", protect, GetProfile)


/**
 * @swagger
 * /api/profile/delete-profile:
 *   delete:
 *     summary: Delete the logged-in user's profile
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete-profile", protect, deleteProfile)


/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Change the logged-in user's password
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Password is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/change-password", protect, changePassword)

module.exports = router
