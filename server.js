const path = require('path');
const express = require('express');
const config = require('./config');
const otpRoutes = require('./routes/otpRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OTP API is running.' });
});

app.use('/api/otp', otpRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong.'
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`OTP system running at http://localhost:${config.port}`);
    console.log('Development email mode is active unless SMTP settings are added to .env.');
  });
}

module.exports = app;

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`OTP system running at http://localhost:${config.port}`);
    console.log('Development email mode is active unless SMTP settings are added to .env.');
  });
}

module.exports = app;