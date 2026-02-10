const express = require('express');
const router = express.Router();
const { register, login } = require('../user-controller/auth');
// const protect = require('../middleware/middleware');

router.post('/register', register);
router.post('/login', login);

module.exports = router;