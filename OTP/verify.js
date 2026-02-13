function verifyOTP(inputOtp, storedOtp, expiresAt) {
  if (Date.now() > expiresAt) {
    return { valid: false, reason: 'OTP expired' };
  }
  if (inputOtp === storedOtp) {
    return { valid: true, reason: 'OTP verified' };
  }
  return { valid: false, reason: 'Incorrect OTP' };
}

module.exports = verifyOTP;