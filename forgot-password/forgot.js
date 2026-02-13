const db = require("../connection/connection");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const generateOTP = require("../OTP/otp"); 
const nodemailer = require("nodemailer");


// nodemailer transporter setup 
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const findUserQuery = `SELECT id, email FROM users WHERE email = ? LIMIT 1`;

  db.query(findUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("[FORGOT_PASSWORD] DB error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(200).json({
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const user = results[0];

    try {
      const otp = await generateOTP(6);

      const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      const expires = new Date(Date.now() + 10 * 60 * 1000);

      const saveOtpQuery = `
        UPDATE users
        SET reset_otp_hash = ?, 
            reset_otp_expires = ?, 
            reset_otp_attempts = 0
        WHERE id = ?
      `;

      db.query(saveOtpQuery, [otpHash, expires, user.id], async (err2) => {
        if (err2) {
          console.error("[FORGOT_PASSWORD] Error saving OTP:", err2);
          return res.status(500).json({ message: "Internal server error" });
        }

        const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "🔐 Password Reset OTP - Circl",
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

        <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
        
        <p style="color: #555; font-size: 15px;">
          We received a request to reset your password for your <strong>Circl</strong> account.
        </p>

        <p style="color: #555; font-size: 15px;">
          Use the OTP below to reset your password:
        </p>

        <div style="
          margin: 25px 0;
          text-align: center;
          font-size: 28px;
          letter-spacing: 8px;
          font-weight: bold;
          color: #2d89ef;
          background: #eef5ff;
          padding: 15px;
          border-radius: 8px;
        ">
          ${otp}
        </div>

        <p style="color: #777; font-size: 14px;">
          ⏳ This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

        <p style="color: #999; font-size: 13px;">
          If you didn’t request this password reset, you can safely ignore this email.
        </p>

        <p style="color: #999; font-size: 13px;">
          — The Circl Team
        </p>

      </div>
    </div>
  `
};
;

        try {
          await transporter.sendMail(mailOptions);
          console.log("[FORGOT_PASSWORD] OTP email sent");

          return res.status(200).json({
            message: "If this email exists, an OTP has been sent.",
          });

        } catch (mailError) {
          console.error("[FORGOT_PASSWORD] Email error:", mailError);
          return res.status(500).json({
            message: "Failed to send OTP email"
          });
        }
      });

    } catch (error) {
      console.error("[FORGOT_PASSWORD] OTP generation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = {forgotPassword}