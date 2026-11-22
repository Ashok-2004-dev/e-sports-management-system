# E-Sports Management System

A web-based E-Sports Management System for organizing players, teams, tournaments, match schedules, results, notifications and live-match information.

## Technology

| Part | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL 8 |
| Database driver | mysql2 |
| Authentication | JWT and bcrypt |
| Email | Nodemailer (SMTP configuration is optional) |

## Requirements

- Node.js 18 or newer (Node.js 20 LTS is recommended)
- npm
- MySQL 8 database, either local or hosted
- Git and Visual Studio Code

Check your installed versions:

```bash
node --version
npm --version
git --version
```

## 1. Get the project

```bash
git clone https://github.com/Ashok-2004-dev/e-sports-management-system.git
cd e-sports-management-system
```

If you already have the repository, update your local main branch:

```bash
git switch main
git pull origin main
```

## 2. Configure the backend

Open a terminal in the project root:

```bash
cd backend
npm install
```

Copy the example environment file to a private `.env` file.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Edit `backend/.env` and enter your own MySQL connection values:

- `DB_HOST`: your MySQL server hostname
- `DB_PORT`: your MySQL port (usually 3306 for a local MySQL server)
- `DB_USER` and `DB_PASSWORD`: your database username and password
- `DB_NAME`: database name (the example uses `emsdb`)
- `DB_SSL`: set to `true` only when your database provider requires SSL
- `DB_SSL_CA`: path to the provider's CA certificate when SSL is enabled
- `JWT_SECRET`: a long, private random value
- `ADMIN_PASSWORD`: a private initial administrator password of at least 9 characters
- `CLIENT_URL`: frontend origin, normally `http://localhost:5173`

Do not use real credentials from another group member. Do not upload or commit `.env`, passwords, JWT secrets, SMTP credentials, or private certificates. If using hosted MySQL with SSL, obtain the CA certificate from your database provider and place it at the path configured in `DB_SSL_CA`.

## 3. Set up the database

Make sure the MySQL database server is reachable and the account has permission to create/use the configured database and tables.

From the `backend` folder:

```bash
npm run setup
```

The setup script applies `database/schema.sql`, creates an administrator if one does not already exist, and loads the sample data unless `--empty` is supplied.

**Warning:** `npm run reset` is destructive. It asks for confirmation and then removes existing tables before rebuilding the schema. Do not run it against data you need to keep.

## 4. Start the backend

In the `backend` folder:

```bash
npm run dev
```

The API runs on port `5000` by default. Keep this terminal open.

You can check the health endpoint at:

`http://localhost:5000/api/health`

## 5. Start the frontend

Open a second terminal at the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite address shown in the terminal (normally `http://localhost:5173`). The Vite configuration forwards `/api` and `/uploads` requests to the backend on port 5000.

To create a production frontend build:

```bash
npm run build
```

## Team GitHub workflow

Each group member should clone the repository and configure Git with their own GitHub identity. Never share GitHub passwords or access tokens.

Before starting a task:

```bash
git switch main
git pull origin main
git switch -c feature/short-task-name
```

After making and testing changes:

```bash
git status
git add .
git commit -m "Describe the change"
git push -u origin feature/short-task-name
```

Then open a Pull Request on GitHub from the feature branch into `main`. Another group member should review it before it is merged. Avoid having multiple people directly edit and push to `main`.

Useful commands:

```bash
git branch
git status
git pull
git log --oneline -5
```

## Project structure

```text
e-sports-management-system/
├── backend/
│   ├── config/          # Database connection
│   ├── lib/             # Shared backend helpers
│   ├── middleware/      # Authentication and upload middleware
│   ├── routes/          # API route handlers
│   ├── scripts/         # Database setup script
│   ├── uploads/         # Runtime uploads and seed assets
│   ├── .env.example     # Environment template (safe to share)
│   ├── package.json
│   └── server.js
├── database/
│   ├── schema.sql       # MySQL table definitions
│   └── seed.sql         # Demonstration data
└── frontend/
    ├── src/             # React application
    ├── package.json
    └── vite.config.js
```

## Important notes

- Each developer should create their own local `backend/.env`; it is intentionally not shared through Git.
- The database must be configured separately on each developer's machine or shared database service.
- Uploaded files are runtime data. Do not commit personal or user-uploaded images unless the team intentionally approves them as project assets.
- Tournament schedules, match scores and other records depend on the database and application workflows.
- Optional integrations such as SMTP and social login require valid provider credentials before they can work.
