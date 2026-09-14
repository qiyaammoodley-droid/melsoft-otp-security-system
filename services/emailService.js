const nodemailer = require('nodemailer');
const config = require('../config');

function smtpIsConfigured() {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass && config.smtp.from);
}

async function sendOtpEmail(email, otp) {
  if (!smtpIsConfigured()) {
    console.log(`\n[DEV EMAIL] OTP for ${email}: ${otp}\n`);
    return { mode: 'development' };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Your verification OTP',
    text: `Your verification code is ${otp}. It expires in ${config.otpExpirySeconds} seconds.`
  });

  return { mode: 'smtp' };
}

module.exports = { sendOtpEmail };
