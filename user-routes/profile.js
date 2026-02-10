const express = require("express")
const router = express.Router()
const { CreateProfile,GetProfile } = require("../user-controller/profile")
const protect = require("../middleware/middleware")
router.post("/create-profile", protect, CreateProfile)
router.get("/get-profile", protect, GetProfile)
module.exports = router