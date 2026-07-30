-- One-off migration: carry the LinkedIn-sourced Andy Dale leads from the
-- old app's tables (renamed to legacy_*) into the new `leads` table as
-- private, admin-only invite candidates. These were never real signups
-- (per project owner: "no real usage, just tests") and are NOT public
-- profiles -- there is no "unclaimed profile" concept in the new schema.
-- Fun facts found during research are folded into a single `highlights`
-- text field per lead, to help personalize a future invite message.

USE AndyDale;

INSERT INTO leads (first_name, last_name, city, country, source, highlights, created_at)
SELECT
  lp.first_name,
  lp.last_name,
  lp.location_city,
  COALESCE(NULLIF(lp.location_country, ''), NULLIF(lp.location_state, '')),
  'linkedin',
  (SELECT GROUP_CONCAT(lf.description SEPARATOR ' | ')
     FROM legacy_fun_facts lf WHERE lf.profile_id = lp.profile_id),
  lp.created_at
FROM legacy_profile lp
WHERE lp.first_name = 'Andy';

SELECT COUNT(*) AS migrated_leads FROM leads;
