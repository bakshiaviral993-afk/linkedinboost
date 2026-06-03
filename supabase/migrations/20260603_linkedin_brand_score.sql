-- Core Schemas for LINKEDIN BRAND SCORE ENGINE, ATS RESUME SCANS, CONTENT CALENDARS, and COMMENTS
-- To be executed in your primary Supabase Database SQL Editor.

CREATE TABLE IF NOT EXISTS public.linkedin_brand_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brand_score INTEGER NOT NULL,
    grade VARCHAR(10) NOT NULL,
    headline_score INTEGER NOT NULL,
    about_score INTEGER NOT NULL,
    keyword_score INTEGER NOT NULL,
    consistency_score INTEGER NOT NULL,
    completeness_score INTEGER NOT NULL,
    engagement_score INTEGER NOT NULL,
    strengths TEXT[] NOT NULL DEFAULT '{}',
    weaknesses TEXT[] NOT NULL DEFAULT '{}',
    improvement_plan TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ats_resume_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ats_score INTEGER NOT NULL,
    readability INTEGER NOT NULL,
    keyword_density INTEGER NOT NULL,
    achievement_impact INTEGER NOT NULL,
    skill_coverage INTEGER NOT NULL,
    scan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.content_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    duration_days INTEGER NOT NULL,
    calendar_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_items TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.generated_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_url_or_content TEXT NOT NULL,
    comment_type VARCHAR(50) NOT NULL,
    comments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_linkedin_brand_scores_user_id ON public.linkedin_brand_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_resume_scans_user_id ON public.ats_resume_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendars_user_id ON public.content_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_comments_user_id ON public.generated_comments(user_id);
