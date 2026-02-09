
-- 1. Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Only admins can view roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Add explicit anonymous access denial policies
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles FOR SELECT TO anon USING (false);

CREATE POLICY "Deny anonymous access to bookings"
  ON public.bookings FOR SELECT TO anon USING (false);

CREATE POLICY "Deny anonymous insert to bookings"
  ON public.bookings FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Deny anonymous update to bookings"
  ON public.bookings FOR UPDATE TO anon USING (false);

CREATE POLICY "Deny anonymous delete to bookings"
  ON public.bookings FOR DELETE TO anon USING (false);

CREATE POLICY "Deny anonymous access to user_preferences"
  ON public.user_preferences FOR SELECT TO anon USING (false);

CREATE POLICY "Deny anonymous insert to user_preferences"
  ON public.user_preferences FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Deny anonymous update to user_preferences"
  ON public.user_preferences FOR UPDATE TO anon USING (false);

CREATE POLICY "Deny anonymous delete to user_preferences"
  ON public.user_preferences FOR DELETE TO anon USING (false);

-- 3. Validate handle_new_user with input sanitization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_avatar_url TEXT;
  v_full_name TEXT;
BEGIN
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  IF v_avatar_url IS NOT NULL AND v_avatar_url !~ '^https?://' THEN
    v_avatar_url := NULL;
  END IF;
  
  v_full_name := SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) FROM 1 FOR 255);

  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, v_full_name, v_avatar_url);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- 4. Create book_seats function to prevent double-booking
CREATE OR REPLACE FUNCTION public.book_seats(
  p_user_id UUID,
  p_movie_id UUID,
  p_seats TEXT[],
  p_showtime TIMESTAMPTZ,
  p_total_amount NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_taken_seats TEXT[];
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT ARRAY_AGG(DISTINCT seat)
  INTO v_taken_seats
  FROM bookings, unnest(seats) AS seat
  WHERE movie_id = p_movie_id
    AND showtime = p_showtime
    AND payment_status IN ('paid', 'pending')
    AND seat = ANY(p_seats);
  
  IF v_taken_seats IS NOT NULL AND array_length(v_taken_seats, 1) > 0 THEN
    RAISE EXCEPTION 'Seats already booked: %', v_taken_seats;
  END IF;
  
  INSERT INTO bookings (user_id, movie_id, seats, showtime, total_amount, payment_status)
  VALUES (p_user_id, p_movie_id, p_seats, p_showtime, p_total_amount, 'pending')
  RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_seats TO authenticated;
