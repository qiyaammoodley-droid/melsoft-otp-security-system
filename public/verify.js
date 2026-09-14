const verifyForm = document.getElementById('verifyForm');
const emailInput = document.getElementById('verifyEmail');
const otpInput = document.getElementById('otp');
const message = document.getElementById('verifyMessage');

const savedEmail = localStorage.getItem('otpEmail');
if (savedEmail) {
  emailInput.value = savedEmail;
}

verifyForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();

  try {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    message.textContent = data.message;
    message.style.color = response.ok ? '#287a43' : '#b42318';
  } catch (error) {
    message.textContent = 'Could not connect to the server.';
    message.style.color = '#b42318';
  }
});
