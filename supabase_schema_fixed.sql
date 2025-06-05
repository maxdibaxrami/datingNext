
-- ============================================
--  Supabase Dating App Schema (SQL Script)
--  Generated: 2025-05-16
--  Copy / run this entire file in the Supabase
--  SQL Editor (or psql) to create all tables,
--  types, and indexes for a million‑user scale
--  dating app similar to Tinder/Badoo.
-- ============================================

-- ---------- EXTENSIONS ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ---------- ENUM TYPES ----------
-- Core profile attributes inspired by Badoo / Tinder
CREATE TYPE gender_enum              AS ENUM ('male','female','non_binary','other');
CREATE TYPE smoking_enum             AS ENUM ('no','occasionally','regularly');
CREATE TYPE drinking_enum            AS ENUM ('no','socially','regularly');
CREATE TYPE education_enum           AS ENUM ('high_school','bachelors','masters','phd','other');
CREATE TYPE children_enum            AS ENUM ('no','yes_fulltime','yes_parttime','want_some_day');
CREATE TYPE relationship_status_enum AS ENUM ('single','divorced','widowed','separated',
                                              'in_relationship','open_relationship');
CREATE TYPE looking_for_enum         AS ENUM ('chat','casual','long_term','friends','virtual');
                                              'hindu','buddhist','spiritual','other');
CREATE TYPE zodiac_enum              AS ENUM ('aries','taurus','gemini','cancer','leo','virgo',
                                              'libra','scorpio','sagittarius','capricorn','aquarius','pisces');
CREATE TYPE pets_enum                AS ENUM ('none','dog','cat','other','many');

-- ---------- DICTIONARIES ----------
-- ISO language codes for spoken languages
CREATE TABLE public.languages (
    code VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL
);

-- ---------- PROFILES ----------
-- Main user info table (linked to auth.users)
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    birth_date      DATE,
    gender          gender_enum,
    bio             TEXT,
    smoking         smoking_enum,
    drinking        drinking_enum,
    education       education_enum,
    children        children_enum,
    relationship_status relationship_status_enum,
    looking_for     looking_for_enum,
    zodiac          zodiac_enum,
    pets            pets_enum,
    height_cm       SMALLINT,
    is_verified     BOOLEAN         DEFAULT FALSE,
    is_visible      BOOLEAN         DEFAULT TRUE,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    -- geospatial column for fast radius search (WGS‑84)
    location        GEOGRAPHY(Point,4326),
    city            TEXT,
    country         TEXT,
    last_seen_at    TIMESTAMP WITH TIME ZONE,
    app_language    VARCHAR(10),
    points          INT             DEFAULT 0,
    referred_by     UUID            REFERENCES public.profiles(id),
    is_banned       BOOLEAN         DEFAULT FALSE,
    is_admin        BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for search
CREATE INDEX profiles_location_idx ON public.profiles USING GIST (location);
CREATE INDEX profiles_visible_gender_idx ON public.profiles (is_visible, gender, birth_date);

-- ---------- USER LANGUAGES ----------
CREATE TABLE public.user_languages (
    user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) REFERENCES public.languages(code),
    PRIMARY KEY (user_id, language_code)
);

-- ---------- USER IMAGES ----------
CREATE TABLE public.user_images (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url    TEXT NOT NULL,
    thumb_url    TEXT,
    medium_url   TEXT,
    sort_order   SMALLINT       DEFAULT 1,
    uploaded_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active    BOOLEAN        DEFAULT TRUE
);
CREATE INDEX idx_user_images_userid ON public.user_images(user_id);

-- ---------- TASKS / GAMIFICATION ----------
CREATE TABLE public.tasks (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT,
    task_type     TEXT NOT NULL CHECK (task_type IN ('daily','one_time')),
    reward_points INT NOT NULL DEFAULT 0
);
CREATE TABLE public.user_task_completions (
    user_id      UUID  REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id      INT   REFERENCES public.tasks(id) ON DELETE CASCADE,
    completed_at DATE  NOT NULL,
    PRIMARY KEY (user_id, task_id, completed_at)
);

-- ---------- REFERRALS ----------
CREATE TABLE public.referrals (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    referrer_id      UUID  REFERENCES public.profiles(id),
    referred_user_id UUID  UNIQUE REFERENCES public.profiles(id),
    referred_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reward_given     BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

-- ---------- MATCHING (SWIPES & MATCHES) ----------
CREATE TYPE swipe_type AS ENUM ('like','dislike','superlike');

CREATE TABLE public.swipes (
    user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action     swipe_type NOT NULL,
    swiped_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, target_id)
);
CREATE INDEX idx_swipes_target ON public.swipes(target_id);

CREATE TABLE public.matches (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user1_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    matched_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active   BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_matches_user1 ON public.matches(user1_id);
CREATE UNIQUE INDEX idx_match_pair ON public.matches ((LEAST(user1_id, user2_id)), (GREATEST(user1_id, user2_id)));
CREATE INDEX idx_matches_user2 ON public.matches(user2_id);

-- ---------- CHAT ----------
CREATE TABLE public.messages (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id      BIGINT REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_id     UUID   REFERENCES public.profiles(id) ON DELETE CASCADE,
    content       TEXT,
    attachment_url TEXT,
    content_type  TEXT NOT NULL DEFAULT 'text',
    sent_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seen_at       TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_messages_match ON public.messages(match_id);

-- ---------- GIFTS ----------
CREATE TABLE public.gift_types (
    id              SMALLINT PRIMARY KEY,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL,              -- 'sticker','animation','voice'
    media_url       TEXT,
    default_audio_url TEXT
);
CREATE TABLE public.gifts (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gift_type_id  SMALLINT REFERENCES public.gift_types(id) ON DELETE RESTRICT,
    message       TEXT,
    attachment_url TEXT,
    sent_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_gifts_receiver ON public.gifts(receiver_id);

-- ---------- FAVORITES ----------
CREATE TABLE public.favorites (
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    favorite_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, favorite_id)
);
CREATE INDEX idx_favorites_favuser ON public.favorites(favorite_id);

-- ---------- BLOCKS ----------
CREATE TABLE public.blocks (
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

-- ---------- REPORTS ----------
CREATE TABLE public.reports (
    id              BIGSERIAL PRIMARY KEY,
    reporter_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    details         TEXT,
    reported_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status          TEXT DEFAULT 'pending',
    admin_id        UUID REFERENCES public.profiles(id)
);
CREATE INDEX idx_reports_reported ON public.reports(reported_user_id);

-- ---------- BASIC RLS ENABLE (policies to be added in dashboard) ----------
ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_images              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_languages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports                  ENABLE ROW LEVEL SECURITY;

-- TODO: Define detailed policies per table based on auth.uid()
-- e.g., allow users to update their own profile, read visible profiles, etc.
