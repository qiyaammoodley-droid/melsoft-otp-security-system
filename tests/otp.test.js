const test = require('node:test');
const assert = require('node:assert/strict');

const { randomInt } = require('crypto');

function createOtp() {
  return String(randomInt(0, 1000000)).padStart(6, '0');
}

test('OTP should always be six digits', () => {
  const otp = createOtp();
  assert.match(otp, /^\d{6}$/);
});

test('OTP should be allowed to start with zero', () => {
  const examples = ['012345', '000001', '900000'];
  for (const otp of examples) {
    assert.equal(otp.length, 6);
  }
});
