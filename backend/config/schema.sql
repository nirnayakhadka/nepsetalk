-- Run this file to initialize your database
-- mysql -u root -p nepsetalk_cms < schema.sql

CREATE DATABASE IF NOT EXISTS nepsetalk_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nepsetalk_cms;

-- ─── Admin Users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  role       ENUM('superadmin','editor') NOT NULL DEFAULT 'editor',
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  slug         VARCHAR(120) NOT NULL UNIQUE,
  description  TEXT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── News Articles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(500) NOT NULL,
  slug         VARCHAR(520) NOT NULL UNIQUE,
  content      LONGTEXT NOT NULL,
  excerpt      TEXT NULL,
  category_id  INT UNSIGNED NULL,
  author_id    INT UNSIGNED NOT NULL,
  status       ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  thumbnail    VARCHAR(500) NULL,
  views        INT UNSIGNED NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id)   REFERENCES admin_users(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_category (category_id)
);

-- ─── Audit Log (optional but recommended) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id   INT UNSIGNED NULL,
  action     VARCHAR(100) NOT NULL,
  entity     VARCHAR(100) NULL,
  entity_id  INT UNSIGNED NULL,
  meta       JSON NULL,
  ip         VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_admin (admin_id),
  INDEX idx_entity (entity, entity_id)
);

-- ─── Ads ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL,
  type ENUM('image','html') NOT NULL DEFAULT 'image',
  image VARCHAR(500) NULL,
  html_content LONGTEXT NULL,
  link_url VARCHAR(500) NULL,
  link_target ENUM('_blank','_self') NOT NULL DEFAULT '_blank',
  status ENUM('active','inactive','scheduled') NOT NULL DEFAULT 'active',
  priority INT DEFAULT 5,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  popup_delay INT DEFAULT 5,
  popup_frequency INT DEFAULT 24,
  width INT NULL,
  height INT NULL,
  impressions INT UNSIGNED DEFAULT 0,
  clicks INT UNSIGNED DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (position),
  INDEX idx_status (status)
);

-- ─── Ad Events (Analytics) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ad_id INT UNSIGNED NOT NULL,
  event_type ENUM('impression','click') NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  page_url VARCHAR(1000) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  INDEX idx_ad (ad_id),
  INDEX idx_event (event_type)
);