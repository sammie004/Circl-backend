const db = require("../connection/connection");
const bcrypt = require("bcrypt");

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and newPassword are required" });
  }

  const findUserQuery = `
    SELECT id, reset_otp_verified, reset_otp_verified_expires
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(findUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("[RESET_PASSWORD] DB error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = results[0];

    if (!user.reset_otp_verified || !user.reset_otp_verified_expires) {
      return res.status(403).json({ message: "OTP not verified. Verify OTP first." });
    }

    const now = new Date();
    const verifiedExpires = new Date(user.reset_otp_verified_expires);

    if (verifiedExpires <= now) {
      return res.status(403).json({ message: "OTP verification expired. Verify OTP again." });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateQuery = `
        UPDATE users
        SET password = ?,
            reset_otp_hash = NULL,
            reset_otp_expires = NULL,
            reset_otp_attempts = 0,
            reset_otp_verified = 0,
            reset_otp_verified_expires = NULL
        WHERE id = ?
      `;

      db.query(updateQuery, [hashedPassword, user.id], (err2) => {
        if (err2) {
          console.error("[RESET_PASSWORD] Update error:", err2);
          return res.status(500).json({ message: "Failed to reset password" });
        }

        return res.status(200).json({
          message: "Password reset successful. Please login again.",
        });
      });
    } catch (hashErr) {
      console.error("[RESET_PASSWORD] Hash error:", hashErr);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = { resetPassword };
