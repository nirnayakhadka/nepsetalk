-- Migration script to add description column to categories table
-- Run this if you already have an existing database

ALTER TABLE categories ADD COLUMN description TEXT NULL DEFAULT NULL;
ALTER TABLE categories ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Verify the changes
DESCRIBE categories;



-- Run this in your MySQL database
-- Blogs table (mirrors your news table structure)

CREATE TABLE IF NOT EXISTS blogs (
  id           INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(500)     NOT NULL,
  slug         VARCHAR(520)     NOT NULL UNIQUE,
  content      LONGTEXT         NOT NULL,
  excerpt      TEXT,
  category_id  INT UNSIGNED,
  author_id    INT UNSIGNED,
  status       ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  thumbnail    VARCHAR(1000),
  read_time    VARCHAR(50),
  views        INT UNSIGNED     NOT NULL DEFAULT 0,
  published_at DATETIME,
  created_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id)   REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_status  (status),
  INDEX idx_slug    (slug),
  INDEX idx_created (created_at)
);



-- Run this in your MySQL database

CREATE TABLE IF NOT EXISTS videos (
  id           INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(500)     NOT NULL,
  description  TEXT,
  category     VARCHAR(100),
  duration     VARCHAR(20),
  thumbnail    VARCHAR(1000),
  url          VARCHAR(1000)    NOT NULL,
  section      ENUM('main','upnext') NOT NULL DEFAULT 'main',
  status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  sort_order   INT UNSIGNED     NOT NULL DEFAULT 0,
  views        INT UNSIGNED     NOT NULL DEFAULT 0,
  created_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_section (section),
  INDEX idx_status  (status),
  INDEX idx_order   (sort_order)
);


-- ── Ads table ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200)  NOT NULL,
  position     ENUM(
    'navbar',
    'hero_banner',
    'sidebar',
    'infeed',
    'popup',
    'news_detail_top',
    'news_detail_middle',
    'news_detail_bottom',
    'blog_detail_top',
    'blog_detail_middle',
    'blog_detail_bottom'
  ) NOT NULL,
  type         ENUM('image','html') NOT NULL DEFAULT 'image',
  image        VARCHAR(1000),
  html_content TEXT,                          -- for HTML/script ads
  link_url     VARCHAR(1000),                 -- where clicking the ad goes
  link_target  ENUM('_blank','_self') NOT NULL DEFAULT '_blank',
  status       ENUM('active','inactive','scheduled') NOT NULL DEFAULT 'active',
  priority     TINYINT UNSIGNED NOT NULL DEFAULT 5,  -- 1=highest, 10=lowest
  start_date   DATETIME,
  end_date     DATETIME,
  -- raw counters
  impressions  INT UNSIGNED NOT NULL DEFAULT 0,
  clicks       INT UNSIGNED NOT NULL DEFAULT 0,
  -- popup specific
  popup_delay  INT UNSIGNED DEFAULT 5,        -- seconds before popup shows
  popup_frequency INT UNSIGNED DEFAULT 24,    -- hours before showing again to same user
  -- sizing hints for frontend
  width        VARCHAR(20)  DEFAULT NULL,     -- e.g. '728px', '100%'
  height       VARCHAR(20)  DEFAULT NULL,     -- e.g. '90px'
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_position (position),
  INDEX idx_status   (status),
  INDEX idx_priority (priority)
);

-- ── Ad events table (detailed tracking) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_events (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ad_id      INT UNSIGNED NOT NULL,
  event_type ENUM('impression','click') NOT NULL,
  ip         VARCHAR(45),
  user_agent VARCHAR(500),
  page_url   VARCHAR(1000),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  INDEX idx_ad_event  (ad_id, event_type),
  INDEX idx_created   (created_at)
);




-- migrations/create_nepse_snapshots.sql
-- Run once to create the NEPSE history table.
-- If you use Sequelize migrations instead, see the JS version below.

CREATE TABLE IF NOT EXISTS nepse_snapshots (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  source          VARCHAR(50)   NOT NULL DEFAULT 'unknown',
  index_value     DECIMAL(12,2) NOT NULL DEFAULT 0,
  `change`        DECIMAL(10,2)          DEFAULT 0,
  change_percent  DECIMAL(8,4)           DEFAULT 0,
  turnover        DECIMAL(18,4)          DEFAULT 0   COMMENT 'Billions NPR',
  total_scrips    INT                    DEFAULT 0,
  gainers         INT                    DEFAULT 0,
  losers          INT                    DEFAULT 0,
  is_market_open  TINYINT(1)             DEFAULT 0,
  fetch_schedule  ENUM('morning','midday','closing','manual','live') DEFAULT 'live',
  payload         JSON                                COMMENT 'Full normalized response',
  created_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX idx_created_at  (created_at),
  INDEX idx_source      (source),
  INDEX idx_index_value (index_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Sequelize migration equivalent (save as migrations/YYYYMMDD-create-nepse-snapshots.js) ──
/*
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nepse_snapshots', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      source:         { type: Sequelize.STRING(50), defaultValue: 'unknown' },
      indexValue:     { type: Sequelize.DECIMAL(12,2), field: 'index_value', defaultValue: 0 },
      change:         { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      changePercent:  { type: Sequelize.DECIMAL(8,4), field: 'change_percent', defaultValue: 0 },
      turnover:       { type: Sequelize.DECIMAL(18,4), defaultValue: 0 },
      totalScrips:    { type: Sequelize.INTEGER, field: 'total_scrips', defaultValue: 0 },
      gainers:        { type: Sequelize.INTEGER, defaultValue: 0 },
      losers:         { type: Sequelize.INTEGER, defaultValue: 0 },
      isMarketOpen:   { type: Sequelize.BOOLEAN, field: 'is_market_open', defaultValue: false },
      fetchSchedule:  { type: Sequelize.ENUM('morning','midday','closing','manual','live'), field: 'fetch_schedule', defaultValue: 'live' },
      payload:        { type: Sequelize.JSON },
      createdAt:      { type: Sequelize.DATE(3), field: 'created_at' },
      updatedAt:      { type: Sequelize.DATE(3), field: 'updated_at' },
    });
    await queryInterface.addIndex('nepse_snapshots', ['created_at']);
    await queryInterface.addIndex('nepse_snapshots', ['source']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('nepse_snapshots');
  },
};
*/