
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const DB_NAME = process.env.DB_NAME || 'emsdb';

function validateDatabaseName(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error('Invalid database name.');
  }
}

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

async function missingColumns(conn, table, requiredColumns) {
  const [rows] = await conn.query(
    `SHOW COLUMNS FROM \`${table}\``
  );

  const existingColumns = rows.map(row => row.Field);

  return requiredColumns.filter(
    column => !existingColumns.includes(column)
  );
}

async function setup() {
  let conn;

  try {
    validateDatabaseName(DB_NAME);

    const adminUser = process.env.ADMIN_USERNAME || 'Admin';
    const adminPass = process.env.ADMIN_PASSWORD;
    const adminEmail = (
      process.env.ADMIN_EMAIL || 'admin@esports.bt'
    ).toLowerCase();

    if (!adminPass || adminPass.length < 9) {
      throw new Error(
        'ADMIN_PASSWORD must be at least 9 characters.'
      );
    }

    if (!process.env.DB_HOST || !process.env.DB_USER ||
        !process.env.DB_PASSWORD) {
      throw new Error('Missing database configuration in .env.');
    }

    const sslEnabled =
      String(process.env.DB_SSL).toLowerCase() === 'true';

    const sslConfig = sslEnabled
      ? {
          ca: process.env.DB_SSL_CA
            ? fs.readFileSync(
                path.resolve(__dirname, '..', process.env.DB_SSL_CA)
              )
            : undefined,
          rejectUnauthorized: true
        }
      : undefined;

    console.log(`Connecting to database server: ${process.env.DB_HOST}`);

    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: sslConfig,
      multipleStatements: true
    });

    console.log('Database server connection successful.');

    // Check whether the database exists.
    const [databases] = await conn.query(
      'SHOW DATABASES LIKE ?',
      [DB_NAME]
    );

    if (databases.length === 0) {
      console.log(`Creating database: ${DB_NAME}`);
      await conn.query(
        `CREATE DATABASE \`${DB_NAME}\``
      );
    }

    await conn.query(`USE \`${DB_NAME}\``);

    console.log(`Using database: ${DB_NAME}`);

    // Optional reset. This operation deletes existing project tables.
    if (process.argv.includes('--reset')) {
      const confirmed = await askConfirmation(
        'WARNING: This will delete existing tables. Type yes to continue: '
      );

      if (!confirmed) {
        console.log('Reset cancelled.');
        return;
      }

      const [tables] = await conn.query(
        `SELECT TABLE_NAME
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ?`,
        [DB_NAME]
      );

      await conn.query('SET FOREIGN_KEY_CHECKS = 0');

      for (const table of tables) {
        await conn.query(
          `DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``
        );
      }

      await conn.query('SET FOREIGN_KEY_CHECKS = 1');

      console.log('Existing tables removed.');
    }

    // Read and execute the database schema.
    const schemaPath = path.join(
      __dirname,
      '..',
      '..',
      'database',
      'schema.sql'
    );

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Replace the original database name if it appears in the schema.
    schema = schema.replace(
      /esms_final/gi,
      DB_NAME
    );

    console.log('Applying database schema...');

    await conn.query(schema);

    console.log('Database schema applied successfully.');

    // Check the users table before creating the administrator.
    const [userTables] = await conn.query(
      `SHOW TABLES LIKE 'users'`
    );

    if (userTables.length === 0) {
      throw new Error(
        'The users table was not created. Check database/schema.sql.'
      );
    }

    const required = [
      'name',
      'username',
      'email',
      'password_hash',
      'role'
    ];

    const missing = await missingColumns(
      conn,
      'users',
      required
    );

    if (missing.length > 0) {
      throw new Error(
        `The users table is missing columns: ${missing.join(', ')}`
      );
    }

    // Check whether an administrator already exists.
    const [existingAdmins] = await conn.query(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      ['admin']
    );

    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash(adminPass, 10);

      await conn.query(
        `INSERT INTO users
         (name, username, email, password_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'Administrator',
          adminUser,
          adminEmail,
          passwordHash,
          'admin'
        ]
      );

      console.log('Administrator account created.');
    } else {
      console.log(
        'An administrator account already exists. No new admin created.'
      );
    }

    // Load sample data unless --empty was supplied.
    if (!process.argv.includes('--empty')) {
      const seedPath = path.join(
        __dirname,
        '..',
        '..',
        'database',
        'seed.sql'
      );

      if (fs.existsSync(seedPath)) {
        const seed = fs.readFileSync(seedPath, 'utf8');

        if (seed.trim()) {
          console.log('Applying sample data...');
          await conn.query(seed);
          console.log('Sample data applied.');
        }
      } else {
        console.log('No seed.sql file found. Skipping sample data.');
      }
    } else {
      console.log('Empty setup selected. Sample data skipped.');
    }

    console.log('\nSetup completed successfully.');

  } catch (error) {
    console.error('\nSetup failed:', error.message);
    process.exitCode = 1;

  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

setup();
