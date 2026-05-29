-- ── MONTHLY CREDIT RESET ────────────────────────────────────
-- Requires pg_cron extension (activate in Supabase → Database → Extensions → pg_cron)

-- Function: reset credits according to current plan
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void AS $$
BEGIN
  -- Free plan → 5 crédits
  UPDATE public.profiles
  SET credits = 5, updated_at = NOW()
  WHERE plan = 'free';

  -- Creator plan → 100 crédits
  UPDATE public.profiles
  SET credits = 100, updated_at = NOW()
  WHERE plan = 'creator';

  -- Studio plan → keep "unlimited" value (don't reset studio users)

  -- Log the batch reset as credit_transactions
  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference)
  SELECT id,
    CASE plan
      WHEN 'free'    THEN 5
      WHEN 'creator' THEN 100
      ELSE 0
    END,
    'grant',
    'Reset mensuel automatique',
    'monthly-cron-' || TO_CHAR(NOW(), 'YYYY-MM')
  FROM public.profiles
  WHERE plan IN ('free', 'creator');

  RAISE NOTICE 'Monthly credit reset completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: 1er du mois à 00:00 UTC
-- IMPORTANT : exécuter manuellement dans Supabase SQL Editor après avoir activé pg_cron
-- SELECT cron.schedule('monthly-credit-reset', '0 0 1 * *', 'SELECT public.reset_monthly_credits()');

-- ── To activate manually after enabling pg_cron extension: ──
-- Run this line once in Supabase SQL Editor:
--   SELECT cron.schedule('monthly-credit-reset', '0 0 1 * *', 'SELECT public.reset_monthly_credits()');
--
-- To verify the job is registered:
--   SELECT * FROM cron.job;
--
-- To test immediately:
--   SELECT public.reset_monthly_credits();
