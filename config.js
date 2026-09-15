require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,
  maxOtpRequestsPerHour: Number(process.env.MAX_OTP_REQUESTS_PER_HOUR) || 3,
  otpExpirySeconds: Number(process.env.OTP_EXPIRY_SECONDS) || 30,
  resendWindowMinutes: Number(process.env.RESEND_WINDOW_MINUTES) || 5,
  maxResendsPerOtp: Number(process.env.MAX_RESENDS_PER_OTP) || 3,
  useTempStorage: process.env.USE_TEMP_STORAGE === 'true',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM
  }
};

module.exports = config;
