const fs = require('fs');
const path = require('path');
const { randomInt, createHash } = require('crypto');
const config = require('../config');

const dataDirectory = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDirectory, 'otps.json');

function ensureDataFile() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '{}');
  }
}

function loadData() {
  ensureDataFile();

  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    return {};
  }
}

function saveData(data) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function normaliseEmail(email) {
  return email.trim().toLowerCase();
}

function hashOtp(otp) {
  return createHash('sha256').update(otp).digest('hex');
}

function generateOtp(previousCodes = []) {
  const previous = new Set(previousCodes);
  let otp;

  do {
    // randomInt(0, 1000000) allows the generated value to start with 0.
    otp = String(randomInt(0, 1000000)).padStart(6, '0');
  } while (previous.has(otp));

  return otp;
}

function getRecentHistory(record) {
  const now = Date.now();
  const dayAgo = now - (24 * 60 * 60 * 1000);

  return (record.history || []).filter((item) => item.createdAt > dayAgo);
}

function cleanRecord(record) {
  const history = getRecentHistory(record);
  return { ...record, history };
}

function getRecord(email) {
  const data = loadData();
  const key = normaliseEmail(email);
  const record = data[key] || {
    history: [],
    requests: [],
    current: null
  };

  const cleaned = cleanRecord(record);
  data[key] = cleaned;
  saveData(data);
  return cleaned;
}

function saveRecord(email, record) {
  const data = loadData();
  data[normaliseEmail(email)] = cleanRecord(record);
  saveData(data);
}

function checkHourlyLimit(record) {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  const recentRequests = (record.requests || []).filter((time) => time > hourAgo);

  if (recentRequests.length >= config.maxOtpRequestsPerHour) {
    return false;
  }

  record.requests = recentRequests;
  return true;
}

function addRequest(record) {
  record.requests.push(Date.now());
}

function isResendAllowed(current) {
  if (!current) return false;

  const resendWindowMs = config.resendWindowMinutes * 60 * 1000;
  return Date.now() - current.createdAt <= resendWindowMs;
}

function createNewOtp(record) {
  const recentCodes = getRecentHistory(record).map((item) => item.code);
  const otp = generateOtp(recentCodes);
  const now = Date.now();

  record.current = {
    codeHash: hashOtp(otp),
    code: otp,
    createdAt: now,
    expiresAt: now + (config.otpExpirySeconds * 1000),
    resendCount: 0,
    used: false
  };

  record.history.push({
    code: otp,
    createdAt: now
  });

  return otp;
}

function resendCurrentOtp(record) {
  const now = Date.now();
  record.current.expiresAt = now + (config.otpExpirySeconds * 1000);
  record.current.resendCount += 1;
  return record.current.code;
}

function requestOtp(email, isResend = false) {
  const record = getRecord(email);

  if (!checkHourlyLimit(record)) {
    const error = new Error('Maximum OTP requests per hour reached. Please try again later.');
    error.status = 429;
    throw error;
  }

  if (isResend && !record.current) {
    const error = new Error('There is no active OTP to resend. Please request an OTP first.');
    error.status = 400;
    throw error;
  }

  if (isResend && record.current.used) {
    const error = new Error('This OTP has already been used. Please request a new OTP.');
    error.status = 400;
    throw error;
  }

  if (isResend && isResendAllowed(record.current)) {
    if (record.current.resendCount >= config.maxResendsPerOtp) {
      const error = new Error('Maximum resends for this OTP reached. Please request a new OTP later.');
      error.status = 429;
      throw error;
    }

    const otp = resendCurrentOtp(record);
    addRequest(record);
    saveRecord(email, record);
    return { otp, resent: true, expiresAt: record.current.expiresAt };
  }

  const otp = createNewOtp(record);
  addRequest(record);
  saveRecord(email, record);

  return { otp, resent: false, expiresAt: record.current.expiresAt };
}

function verifyOtp(email, otp) {
  const record = getRecord(email);
  const current = record.current;

  if (!current) {
    return { valid: false, message: 'No OTP has been requested for this email.' };
  }

  if (current.used) {
    return { valid: false, message: 'This OTP has already been used.' };
  }

  if (Date.now() > current.expiresAt) {
    return { valid: false, message: 'This OTP has expired.' };
  }

  if (hashOtp(otp) !== current.codeHash) {
    return { valid: false, message: 'Invalid OTP.' };
  }

  current.used = true;
  saveRecord(email, record);

  return { valid: true, message: 'OTP verified successfully.' };
}

module.exports = {
  requestOtp,
  verifyOtp,
  normaliseEmail
};
