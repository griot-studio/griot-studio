-- ── USERS (extend auth.users) ──────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','creator','studio')),
  credits       INTEGER NOT NULL DEFAULT 5,
  stripe_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── GENERATIONS ─────────────────────────────────────────────
CREATE TABLE public.generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_fr     TEXT NOT NULL,
  prompt_en     TEXT NOT NULL,
  style         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image','video')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  credits_used  INTEGER NOT NULL DEFAULT 1,
  fal_request_id TEXT,
  results       JSONB DEFAULT '[]',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── MEDIA (images/vidéos générées) ──────────────────────────
CREATE TABLE public.media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  url           TEXT NOT NULL,
  r2_key        TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image','video')),
  style         TEXT,
  prompt        TEXT,
  is_favorite   BOOLEAN DEFAULT FALSE,
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_sub_id       TEXT UNIQUE NOT NULL,
  stripe_price_id     TEXT NOT NULL,
  plan                TEXT NOT NULL,
  status              TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  cancel_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── CREDIT TRANSACTIONS ──────────────────────────────────────
CREATE TABLE public.credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('grant','debit','refund','purchase')),
  description TEXT,
  reference   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX idx_media_user_id ON public.media(user_id);
CREATE INDEX idx_media_created_at ON public.media(created_at DESC);
CREATE INDEX idx_media_is_favorite ON public.media(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_credit_tx_user_id ON public.credit_transactions(user_id, created_at DESC);

-- ── RLS POLICIES ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own generations"
  ON public.generations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own media"
  ON public.media FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- ── TRIGGERS ─────────────────────────────────────────────────
-- Créer profil auto à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at auto
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER generations_touch_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER subscriptions_touch_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
