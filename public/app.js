const sendForm = document.getElementById('sendForm');
const resendButton = document.getElementById('resendButton');
const emailInput = document.getElementById('sendEmail');
const message = document.getElementById('sendMessage');

function showMessage(text, success = false) {
  message.textContent = text;
  message.style.color = success ? '#287a43' : '#b42318';
}

async function sendRequest(url, email) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

sendForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();

  try {
    const data = await sendRequest('/api/otp/send', email);
    localStorage.setItem('otpEmail', email);
    showMessage(`${data.message} Check the email or the server terminal in development mode.`, true);
  } catch (error) {
    showMessage(error.message);
  }
});

resendButton.addEventListener('click', async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage('Enter your email address first.');
    return;
  }

  try {
    const data = await sendRequest('/api/otp/resend', email);
    showMessage(`${data.message} The expiry time was updated.`, true);
  } catch (error) {
    showMessage(error.message);
  }
});
