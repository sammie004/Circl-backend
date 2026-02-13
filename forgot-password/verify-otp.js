const db = require("../connection/connection");
const crypto = require("crypto");

const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const findUserQuery = `
    SELECT id, reset_otp_hash, reset_otp_expires, reset_otp_attempts
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(findUserQuery, [email], (err, results) => {
    if (err) {
      console.error("[VERIFY_OTP] DB error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid OTP or expired" });
    }

    const user = results[0];

    if (!user.reset_otp_hash || !user.reset_otp_expires) {
      return res.status(400).json({ message: "No OTP request found. Request a new OTP." });
    }

    // Attempts limit
    const attempts = Number(user.reset_otp_attempts || 0);
    if (attempts >= 5) {
      return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
    }

    // Expiry check
    const now = new Date();
    const expiresAt = new Date(user.reset_otp_expires);
    if (expiresAt <= now) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Compare hash
    const incomingHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    if (incomingHash !== user.reset_otp_hash) {
      const incAttemptsQuery = `
        UPDATE users SET reset_otp_attempts = reset_otp_attempts + 1 WHERE id = ?
      `;
      db.query(incAttemptsQuery, [user.id], (e) => {
        if (e) console.error("[VERIFY_OTP] Failed to increment attempts:", e);
      });

      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark verified for a short window (e.g., 5 mins)
    const verifiedExpires = new Date(Date.now() + 5 * 60 * 1000);

    const markVerifiedQuery = `
      UPDATE users
      SET reset_otp_verified = 1,
          reset_otp_verified_expires = ?,
          reset_otp_attempts = 0
      WHERE id = ?
    `;

    db.query(markVerifiedQuery, [verifiedExpires, user.id], (err2) => {
      if (err2) {
        console.error("[VERIFY_OTP] Error marking verified:", err2);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({
        message: "OTP verified successfully. You can now reset your password.",
      });
    });
  });
};

module.exports = { verifyOtp };
