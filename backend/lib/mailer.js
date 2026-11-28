const nodemailer = require('nodemailer');
const { HttpError } = require('../middleware/helpers');

// Sends one email. Problems are reported with a clear message instead of "Server error".
module.exports = async function sendMail(to, subject, text) {
  const { SMTP_HOST, SMTP_USER } = process.env;
  // Gmail shows app passwords as "xxxx xxxx xxxx xxxx"; the spaces are not part of the password
  let pass = process.env.SMTP_PASS || '';
  if (/gmail/i.test(SMTP_HOST || '')) pass = pass.replace(/\s/g, '');

  // Local dev OTP mode: all SMTP lines blank. Nothing is emailed; the message is printed in this terminal.
  if (!SMTP_HOST && !SMTP_USER && !pass && process.env.NODE_ENV !== 'production') {
    console.log(`[DEV MAIL] To: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }

  if (!SMTP_HOST || !SMTP_USER || !pass) {
    console.error('Email not sent: set SMTP_HOST, SMTP_USER and SMTP_PASS in backend/.env, then restart the backend.');
    throw new HttpError(503, 'Email is not set up on the server yet, so no code could be sent.');
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: SMTP_USER, pass },
    connectionTimeout: 15000,
  });

  try {
    await transporter.sendMail({ from: process.env.SMTP_FROM || SMTP_USER, to, subject, text });
  } catch (e) {
    console.error('Email not sent:', e.code || '', e.message);
    throw new HttpError(503, e.code === 'EAUTH'
      ? 'The email account rejected the login. Check SMTP_USER and SMTP_PASS (Gmail needs an App Password).'
      : 'Could not send the email. Check the SMTP settings and your internet connection.');
  }

  console.log(`Email sent to ${to}`);
};
