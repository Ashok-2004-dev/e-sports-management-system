-- E-Sports Management System - database structure (MySQL 8). Sample data is in seed.sql
CREATE DATABASE IF NOT EXISTS esms_final CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE esms_final;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  role ENUM('admin','player') NOT NULL DEFAULT 'player',
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
  provider_id VARCHAR(120) NULL,
  avatar_url VARCHAR(500) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  dzongkhag VARCHAR(50),
  contact_no VARCHAR(20),
  avatar_url VARCHAR(500) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  category VARCHAR(30) NOT NULL DEFAULT 'other',
  description TEXT,
  image_url VARCHAR(500) NULL,
  -- how many players one team may have for this game (PUBG Mobile = 4)
  team_size INT NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(60),
  coach_name VARCHAR(100),
  logo_url VARCHAR(500) NULL,
  captain_id INT NULL,
  game_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY (captain_id) REFERENCES players(id) ON DELETE SET NULL
);

-- one membership row per player (pending = join request, approved = member)
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  player_id INT NOT NULL UNIQUE,
  status ENUM('pending','approved') NOT NULL DEFAULT 'pending',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  game_id INT NOT NULL,
  description TEXT,
  location VARCHAR(120),
  banner_url VARCHAR(500) NULL,
  prize_pool DECIMAL(12,2) NOT NULL DEFAULT 0,
  registration_deadline DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('upcoming','ongoing','completed') NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  player_id INT NOT NULL,
  team_id INT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournament_player (tournament_id, player_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  team1_id INT NOT NULL,
  team2_id INT NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'Group Stage',
  match_date DATETIME NOT NULL,
  -- LIVE GAMES: is_live = 1 while the match is being played. live_score1/2 are the running score
  -- (the final score still goes in `results`). stream_url is an optional YouTube / Twitch link.
  is_live TINYINT(1) NOT NULL DEFAULT 0,
  live_score1 INT NOT NULL DEFAULT 0,
  live_score2 INT NOT NULL DEFAULT 0,
  stream_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- a match with a row here is "completed"; without one it is "live" (is_live = 1) or "scheduled"
CREATE TABLE IF NOT EXISTS results (
  match_id INT PRIMARY KEY,
  score1 INT NOT NULL,
  score2 INT NOT NULL,
  winner_id INT NULL,
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- messages shown in the bell / notification pages of both dashboards
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'info',
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  link VARCHAR(200) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_feed (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- one-time codes for "Forgot password" (player and admin). Only a hash of the code is stored.
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
