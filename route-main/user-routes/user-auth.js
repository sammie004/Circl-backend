const express = require('express');
const router = express.Router();

const { register, login } = require('../../user-controller/auth');
const { forgotPassword } = require('../../forgot-password/forgot');
const { resetPassword } = require('../../forgot-password/reset');
const { verifyOtp } = require('../../forgot-password/verify-otp');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: samuel@school.edu
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: samuel@school.edu
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account locked
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP to be sent to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: samuel@school.edu
 *     responses:
 *       200:
 *         description: If the email exists, an OTP has been sent (generic response for security)
 *       400:
 *         description: Email is required
 *       500:
 *         description: Internal server error (DB error or email sending failure)
 */
router.post('/forgot-password', forgotPassword);


/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify the OTP sent to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: samuel@school.edu
 *               otp:
 *                 type: string
 *                 example: A1B2C3
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP / expired OTP / missing fields
 *       429:
 *         description: Too many invalid attempts
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', verifyOtp);


/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: samuel@school.edu
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Missing fields / invalid request
 *       403:
 *         description: OTP not verified or verification expired
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', resetPassword);

module.exports = router;
