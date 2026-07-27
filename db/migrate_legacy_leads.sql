-- One-off migration: carry the LinkedIn-sourced Andy Dale leads from the
-- old app's tables (renamed to legacy_*) into the new schema as unclaimed
-- profiles (account_id NULL). These were never real signups (per project
-- owner: "no real usage, just tests") so accounts/emails/messages are
-- intentionally NOT migrated -- only the profile identity, location, and
-- fun facts, which are the actual research worth keeping for a future
-- invite pass.

USE AndyDale;

INSERT INTO profile (first_name, last_name, preferred_name, bio, current_city, current_country, created_at, updated_at)
SELECT first_name, last_name, NULLIF(aka, ''), bio, location_city,
       COALESCE(NULLIF(location_country, ''), NULLIF(location_state, '')),
       created_at, updated_at
FROM legacy_profile
WHERE first_name = 'Andy';

-- Map legacy_profile.profile_id -> new profile.profile_id by matching on
-- identity + created_at (only safe because this is a one-off, one-time
-- migration of a small, already-reviewed dataset).
INSERT INTO fun_facts (profile_id, type, description)
SELECT p.profile_id, lf.type, lf.description
FROM legacy_fun_facts lf
JOIN legacy_profile lp ON lp.profile_id = lf.profile_id
JOIN profile p
  ON p.first_name = lp.first_name
 AND p.last_name = lp.last_name
 AND p.created_at = lp.created_at;

SELECT COUNT(*) AS migrated_profiles FROM profile;
SELECT COUNT(*) AS migrated_fun_facts FROM fun_facts;
