-- Andy Dale Profile — core schema
-- MySQL 8+

CREATE DATABASE IF NOT EXISTS AndyDale;
USE AndyDale;

-- ============================================================
-- Accounts & membership
-- ============================================================

CREATE TABLE accounts (
  account_id            INT AUTO_INCREMENT PRIMARY KEY,
  login_email           VARCHAR(255) NOT NULL UNIQUE, -- real email, used only for login/system notices; never shown to other users
  password_hash         VARCHAR(255) NOT NULL,         -- local email+password auth only for v1, no SSO
  membership_status     ENUM('pending','verified','denied') NOT NULL DEFAULT 'pending',
  is_admin              TINYINT(1) NOT NULL DEFAULT 0,
  notification_mode     ENUM('in_app_only','email_linked') NOT NULL DEFAULT 'in_app_only',
  search_participation  ENUM('findable','notify_only','invisible') NOT NULL DEFAULT 'notify_only',
  comms_visibility      ENUM('public','verified_only') NOT NULL DEFAULT 'verified_only', -- who can send a first-contact request
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit trail for the admin approve/deny queue. accounts.membership_status
-- holds current state; this table holds the history behind it.
CREATE TABLE join_requests (
  request_id     INT AUTO_INCREMENT PRIMARY KEY,
  account_id     INT NOT NULL,
  status         ENUM('pending','approved','denied') NOT NULL DEFAULT 'pending',
  reviewed_by    INT NULL,
  notes          TEXT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at    TIMESTAMP NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES accounts(account_id) ON DELETE SET NULL
);

-- ============================================================
-- Profile
-- ============================================================
-- visibility_tier per field group:
--   basic      -> visible to everyone, including pending accounts
--   detailed   -> visible to verified accounts only
--   connection -> visible only once a message thread exists between the two accounts
-- Basic fields live directly on `profile`. Detailed/sensitive fields are
-- split out below so the app can apply a blanket rule per group without an
-- EAV-style per-field visibility table (revisit if finer control is needed).

CREATE TABLE profile (
  profile_id             INT AUTO_INCREMENT PRIMARY KEY,
  account_id             INT NOT NULL UNIQUE, -- every profile belongs to a real account; no signup, no profile
  first_name             VARCHAR(50) NOT NULL DEFAULT 'Andy',
  last_name              VARCHAR(50) NOT NULL DEFAULT 'Dale',
  preferred_name         VARCHAR(50) NULL,  -- "aka"
  bio                    TEXT NULL,
  photo_url              VARCHAR(255) NULL,
  current_city           VARCHAR(100) NULL, -- basic, public
  current_country        VARCHAR(100) NULL, -- basic, public
  origin_story           TEXT NULL,         -- "why I'm named Andy Dale" - basic, public
  claims_to_fame         TEXT NULL,         -- basic, public
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- Detailed / disambiguation fields: verified-only visibility as a group default
CREATE TABLE profile_detail (
  profile_id          INT PRIMARY KEY,
  hometown_city       VARCHAR(100) NULL,
  hometown_country    VARCHAR(100) NULL,
  birth_year          SMALLINT NULL,       -- store exact year; app buckets to a range/decade for display
  current_job_title   VARCHAR(100) NULL,
  current_employer    VARCHAR(100) NULL,
  linkedin_url        VARCHAR(255) NULL,
  personal_website_url VARCHAR(255) NULL,
  languages_spoken    VARCHAR(255) NULL,   -- comma-separated for v1
  FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
);

CREATE TABLE profile_education (
  education_id    INT AUTO_INCREMENT PRIMARY KEY,
  profile_id      INT NOT NULL,
  school_name     VARCHAR(150) NOT NULL,
  field_of_study  VARCHAR(150) NULL,
  start_year      SMALLINT NULL,
  end_year        SMALLINT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
);

CREATE TABLE profile_employment (
  employment_id   INT AUTO_INCREMENT PRIMARY KEY,
  profile_id      INT NOT NULL,
  employer_name   VARCHAR(150) NOT NULL,
  job_title       VARCHAR(150) NULL,
  start_year      SMALLINT NULL,
  end_year        SMALLINT NULL,           -- NULL = current
  FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
);

CREATE TABLE fun_facts (
  fact_id       INT AUTO_INCREMENT PRIMARY KEY,
  profile_id    INT NOT NULL,
  type          ENUM('Quote','Talent','Fact') NOT NULL,
  description   TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
);

CREATE TABLE tags (
  tag_id    INT AUTO_INCREMENT PRIMARY KEY,
  category  ENUM('skill','hobby') NOT NULL,
  name      VARCHAR(100) NOT NULL,
  UNIQUE KEY (category, name)
);

CREATE TABLE profile_tags (
  profile_id  INT NOT NULL,
  tag_id      INT NOT NULL,
  PRIMARY KEY (profile_id, tag_id),
  FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE profile_links (
  link_id     INT AUTO_INCREMENT PRIMARY KEY,
  profile_id  INT NOT NULL,
  platform    VARCHAR(50) NOT NULL, -- e.g. 'instagram', 'twitter', 'website'
  url         VARCHAR(255) NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
);

-- ============================================================
-- Messaging: first-contact request -> thread -> messages
-- ============================================================

-- Pre-thread stage. No personal email alias is ever generated here;
-- recipients are notified via a generic system address and must open the
-- app to accept/decline. Accepting creates a message_threads row.
CREATE TABLE connection_requests (
  request_id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_account_id   INT NOT NULL,
  recipient_account_id INT NOT NULL,
  message             TEXT NOT NULL,
  status              ENUM('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
  source              ENUM('direct','search_match') NOT NULL DEFAULT 'direct', -- how the sender found the recipient
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at        TIMESTAMP NULL,
  FOREIGN KEY (sender_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- alias_token is a random opaque string (not derived from the two account
-- ids) so a leaked token can't be reverse-engineered to enumerate other
-- pairs. Blast radius of a leak/spam is this one thread, not the account.
CREATE TABLE message_threads (
  thread_id     INT AUTO_INCREMENT PRIMARY KEY,
  alias_token   VARCHAR(32) NOT NULL UNIQUE,
  status        ENUM('active','rotated','blocked') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE thread_participants (
  thread_id   INT NOT NULL,
  account_id  INT NOT NULL,
  PRIMARY KEY (thread_id, account_id),
  FOREIGN KEY (thread_id) REFERENCES message_threads(thread_id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE messages (
  message_id        INT AUTO_INCREMENT PRIMARY KEY,
  thread_id         INT NOT NULL,
  sender_account_id INT NOT NULL,
  body              TEXT NOT NULL,
  delivery_channel  ENUM('in_app','email') NOT NULL DEFAULT 'in_app',
  relay_status      ENUM('n/a','pending','sent','failed') NOT NULL DEFAULT 'n/a', -- only meaningful when delivery_channel = 'email'
  failure_reason    TEXT NULL,
  delivered_at      TIMESTAMP NULL,
  read_at           TIMESTAMP NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES message_threads(thread_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- ============================================================
-- Find an Andy (opt-in directory search)
-- ============================================================

-- Reverse-notify: fires for accounts with search_participation = 'notify_only'
-- when a search matches them. They are never shown to the searcher; they
-- can only respond by turning their own match into a connection_request
-- back to the searcher.
CREATE TABLE search_match_notifications (
  notification_id       INT AUTO_INCREMENT PRIMARY KEY,
  matched_account_id    INT NOT NULL,
  searcher_account_id   INT NOT NULL,
  search_criteria       JSON NOT NULL,
  message               TEXT NULL, -- what the searcher would say, shown to the matched account if they choose to look
  status                ENUM('pending','responded','ignored') NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matched_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (searcher_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- ============================================================
-- Leads (admin-only, not part of the public product surface)
-- ============================================================
-- Sourced candidates (e.g. found on LinkedIn) who haven't joined yet.
-- Deliberately separate from `profile`: nothing here is ever shown to other
-- users or exposed publicly. It exists purely so an admin can send a one-time
-- invite. Once someone actually joins, they get a normal profile like anyone
-- else -- there is no "claim" flow linking a signup back to a lead row.

CREATE TABLE leads (
  lead_id           INT AUTO_INCREMENT PRIMARY KEY,
  first_name        VARCHAR(50) NOT NULL DEFAULT 'Andy',
  last_name         VARCHAR(50) NOT NULL DEFAULT 'Dale',
  city              VARCHAR(100) NULL,
  country           VARCHAR(100) NULL,
  source            VARCHAR(50) NOT NULL DEFAULT 'linkedin',
  highlights        TEXT NULL,  -- notable facts found during research, to personalize the invite
  status            ENUM('not_invited','invited','joined') NOT NULL DEFAULT 'not_invited',
  invited_at        TIMESTAMP NULL,
  joined_account_id INT NULL,  -- set by admin if/when this lead is recognized to have joined; tracking only
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (joined_account_id) REFERENCES accounts(account_id) ON DELETE SET NULL
);

-- ============================================================
-- Trust & safety
-- ============================================================

CREATE TABLE blocks (
  blocker_account_id  INT NOT NULL,
  blocked_account_id  INT NOT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_account_id, blocked_account_id),
  FOREIGN KEY (blocker_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE reports (
  report_id           INT AUTO_INCREMENT PRIMARY KEY,
  reporter_account_id INT NOT NULL,
  reported_account_id INT NOT NULL,
  thread_id           INT NULL,
  reason              TEXT NOT NULL,
  status              ENUM('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
  reviewed_by         INT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at         TIMESTAMP NULL,
  FOREIGN KEY (reporter_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (reported_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (thread_id) REFERENCES message_threads(thread_id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES accounts(account_id) ON DELETE SET NULL
);

CREATE TABLE admin_audit_log (
  log_id            INT AUTO_INCREMENT PRIMARY KEY,
  admin_account_id  INT NOT NULL,
  action            VARCHAR(100) NOT NULL,   -- e.g. 'approve_join_request', 'ban_account'
  target_type       VARCHAR(50) NOT NULL,    -- e.g. 'account', 'profile', 'report'
  target_id         INT NOT NULL,
  notes             TEXT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
