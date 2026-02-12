const express = require("express")
const router = express.Router()

const { filterUsers } = require("../search-filter/filter")
const protect = require ('../middleware/middleware')

router.get('/filter', protect, filterUsers)

module.exports = router