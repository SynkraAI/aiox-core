-- Basic post-migration checks (fill placeholders)
SET client_min_messages = warning;

-- Count tables/policies/functions expected
SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='public';
SELECT COUNT(*) AS policies FROM pg_policies WHERE schemaname='public';
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('current_mind_id','provision_user_profile','set_fragment_mind_id');

-- Sanity queries (examples)
-- SELECT * FROM categories LIMIT 5;
-- SELECT * FROM minds LIMIT 5;

-- RLS sanity (should not error even if it returns 0)
-- SET LOCAL request.jwt.claims = '{"sub":"<user-uuid>","role":"authenticated"}';
-- SELECT 1 FROM fragments WHERE false;
