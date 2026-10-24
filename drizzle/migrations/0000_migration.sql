CREATE TABLE public.grids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL DEFAULT 'My grid',
  username text NOT NULL DEFAULT 'username',
  display_name text NOT NULL DEFAULT 'Your Name',
  category text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  avatar_url text,
  followers text NOT NULL DEFAULT '1,024',
  following text NOT NULL DEFAULT '312',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id uuid NOT NULL REFERENCES public.grids(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'photo',
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  pinned boolean NOT NULL DEFAULT false,
  position double precision NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id uuid NOT NULL REFERENCES public.grids(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Highlight',
  cover_url text,
  position double precision NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grids, public.posts, public.highlights TO anon, authenticated;
GRANT ALL ON public.grids, public.posts, public.highlights TO service_role;
ALTER TABLE public.grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
-- Single-user private tool for now; tighten to owner_id = auth.uid() when login is added.
CREATE POLICY "open grids" ON public.grids FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open posts" ON public.posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open highlights" ON public.highlights FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX posts_grid_idx ON public.posts(grid_id, position);
CREATE INDEX highlights_grid_idx ON public.highlights(grid_id, position);
CREATE POLICY "media read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "media insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "media delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'media');