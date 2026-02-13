const express = require("express");
const router = express.Router();

const { filterUsers } = require("../../search-filter/filter");
const protect = require("../../middleware/middleware");

/**
 * @swagger
 * /api/search/filter:
 *   get:
 *     summary: Filter users by faculty and/or level
 *     tags: [Search]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: faculty
 *         schema:
 *           type: string
 *         required: false
 *         description: Faculty to filter by (e.g., Science)
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         required: false
 *         description: Level to filter by (e.g., 300)
 *     responses:
 *       200:
 *         description: Users filtered successfully
 *       401:
 *         description: Unauthorized (missing/invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/filter", protect, filterUsers);

module.exports = router;
