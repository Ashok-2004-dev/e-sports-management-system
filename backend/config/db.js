const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sslEnabled = String(process.env.DB_SSL || '').toLowerCase() === 'true';
let ssl;
if (sslEnabled) {
  const caPath = path.resolve(__dirname, '..', process.env.DB_SSL_CA || 'certs/ca.pem');
  if (!fs.existsSync(caPath)) {
    throw new Error(`Aiven CA certificate not found: ${caPath}. Download it from Aiven and save it at backend/certs/ca.pem.`);
  }
  ssl = { ca: fs.readFileSync(caPath, 'utf8'), rejectUnauthorized: true };
}

module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'esms_final',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  ...(ssl ? { ssl } : {}),
});
