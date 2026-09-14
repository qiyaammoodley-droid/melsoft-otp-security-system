const express = require('express');
const { requestOtp, verifyOtp, normaliseEmail } = require('../services/otpService');
const { sendOtpEmail } = require('../services/emailService');

const router = express.Router();

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

router.post('/send', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const cleanEmail = normaliseEmail(email);
    const result = requestOtp(cleanEmail);
    await sendOtpEmail(cleanEmail, result.otp);

    return res.status(200).json({
      message: 'OTP sent successfully.',
      expiresAt: result.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/resend', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const cleanEmail = normaliseEmail(email);
    const result = requestOtp(cleanEmail, true);
    await sendOtpEmail(cleanEmail, result.otp);

    return res.status(200).json({
      message: 'OTP resent successfully.',
      expiresAt: result.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!/^\d{6}$/.test(String(otp || ''))) {
      return res.status(400).json({ message: 'OTP must be exactly 6 digits.' });
    }

    const result = verifyOtp(normaliseEmail(email), String(otp));

    return res.status(result.valid ? 200 : 400).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
