// Sends the password-reset code. If SMTP is configured in .env AND the optional "nodemailer" package is installed
// (npm i nodemailer) the code is e-mailed. Otherwise it is printed in the BACKEND console (fine for a local / college demo).
module.exports = async function sendMail(to, subject, text) {
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = require('nodemailer');
      const t = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
      return;
    } catch (e) { console.error('E-mail could not be sent, showing the code here instead:', e.message); }
  }
  console.log(`\n=== PASSWORD RESET (e-mail not configured) ===\nTo: ${to}\n${text}\n==============================================\n`);
};
