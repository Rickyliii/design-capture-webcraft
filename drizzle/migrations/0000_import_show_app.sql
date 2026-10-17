CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Hackathon setup: the very first account created becomes the show admin.
CREATE OR REPLACE FUNCTION public.grant_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_first_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_first_admin();

CREATE TABLE public.show_state (
  event_id text PRIMARY KEY,
  mode text NOT NULL DEFAULT 'idle',
  global_color text,
  sequence_name text,
  sequence_start_time timestamptz,
  is_show_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.show_state TO anon, authenticated;
GRANT UPDATE ON public.show_state TO authenticated;
GRANT ALL ON public.show_state TO service_role;
ALTER TABLE public.show_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads show state" ON public.show_state FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins update show state" ON public.show_state FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.show_state (event_id) VALUES ('jb-toronto-2026-10-20');
ALTER PUBLICATION supabase_realtime ADD TABLE public.show_state;

CREATE TABLE public.light_fans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  fan_id text NOT NULL,
  nickname text NOT NULL,
  star_color text NOT NULL,
  star_type text NOT NULL,
  first_concert_self_reported text,
  activated boolean NOT NULL DEFAULT false,
  light_sent boolean NOT NULL DEFAULT false,
  challenge_done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, fan_id)
);
GRANT ALL ON public.light_fans TO service_role;
ALTER TABLE public.light_fans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.light_activity (
  id bigserial PRIMARY KEY,
  event_id text NOT NULL,
  fan_id text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.light_activity TO service_role;
GRANT USAGE ON SEQUENCE public.light_activity_id_seq TO service_role;
ALTER TABLE public.light_activity ENABLE ROW LEVEL SECURITY;