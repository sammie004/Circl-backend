const crypto = require('crypto');

function generateOTP(length = 6) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        console.error('[OTP] Error generating OTP:', err);
        return reject(err);
      }
      // Convert buffer to hex, slice to desired length
      const otp = buffer.toString('hex').slice(0, length).toUpperCase();
      console.log('[OTP] Generated OTP:', otp);
      resolve(otp);
    });
  });
}

module.exports = generateOTP;