# Melsoft OTP Security System

A small Node.js + Express project that implements the OTP security requirements from the Software Development Practical Project brief.

## Features

- Generates a 6-digit OTP, including values that start with 0.
- Prevents a newly generated OTP from matching an OTP generated for the same email in the previous 24 hours.
- Maximum of 3 OTP requests per email per hour.
- Only the latest OTP is valid.
- OTP expires after 30 seconds.
- Resend within 5 minutes sends the original OTP and updates its expiry time.
- Maximum of 3 resends for one OTP.
- OTP can only be successfully used once.
- Simple frontend with Send OTP and Verify OTP screens.
- Optional SMTP email sending using Nodemailer.
- Development mode logs the OTP in the terminal when SMTP is not configured, which makes local testing possible without email credentials.

## Setup

1. Install Node.js.
2. Open the project folder in the terminal.
3. Run:

```bash
npm install
```

4. Optional: copy `.env.example` to `.env` and add SMTP settings if real email sending is required.
5. Start the server:

```bash
npm start
```

6. Open `http://localhost:3000` in a browser.

## Testing the flow

1. Enter an email on the Send OTP screen.
2. Click **Send OTP**.
3. In development mode, copy the OTP printed in the terminal.
4. Go to **Verify OTP**.
5. Enter the email and OTP.
6. A successful verification makes the OTP used, so the same OTP cannot be used again.
7. Test **Resend OTP** within five minutes to confirm the same OTP is resent and its expiry is refreshed.
8. Try an incorrect OTP and an expired OTP to test the error handling.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check that the API is running |
| POST | `/api/otp/send` | Generate and send a new OTP |
| POST | `/api/otp/resend` | Resend the current OTP when allowed |
| POST | `/api/otp/verify` | Verify an OTP |

## Example request

```json
{
  "email": "student@example.com"
}
```

Verify request:

```json
{
  "email": "student@example.com",
  "otp": "012345"
}
```

## Project structure

```text
otp-security-project/
├── data/
├── public/
│   ├── index.html
│   ├── verify.html
│   ├── style.css
│   ├── app.js
│   └── verify.js
├── routes/
│   └── otpRoutes.js
├── services/
│   ├── emailService.js
│   └── otpService.js
├── tests/
│   └── otp.test.js
├── .env.example
├── .gitignore
├── config.js
├── package.json
├── README.md
└── server.js
```

## Notes

The project keeps the implementation fairly simple so the logic is easy to follow and explain in a practical assessment. For a larger production system, the in-memory/file approach could be replaced with a proper database and a dedicated rate-limiting system.
