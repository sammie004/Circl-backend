const express = require("express")
const router = express.Router()

// controllers
const { createIntent, GetIntents } = require("../intent-handling/intent")

// middleware
const protect = require("../middleware/middleware")

// routes
router.post("/create-intent", protect, createIntent)
router.get("/get-intents", protect, GetIntents)

module.exports = router