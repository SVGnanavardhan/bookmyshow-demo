
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
  v_expected_amount NUMERIC;
  v_seat TEXT;
  v_movie_available BOOLEAN;
BEGIN
  -- Auth check
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate seats array is not empty and not too large
  IF p_seats IS NULL OR array_length(p_seats, 1) IS NULL OR array_length(p_seats, 1) = 0 THEN
    RAISE EXCEPTION 'No seats selected';
  END IF;
  
  IF array_length(p_seats, 1) > 10 THEN
    RAISE EXCEPTION 'Cannot book more than 10 seats at once';
  END IF;

  -- Validate seat format (A1-A8, B1-B8, C1-C8, D1-D8, E1-E8)
  FOREACH v_seat IN ARRAY p_seats LOOP
    IF v_seat !~ '^[A-E][1-8]$' THEN
      RAISE EXCEPTION 'Invalid seat: %', v_seat;
    END IF;
  END LOOP;

  -- Validate movie exists and is available
  SELECT EXISTS(
    SELECT 1 FROM movies 
    WHERE id = p_movie_id 
    AND is_available = true
  ) INTO v_movie_available;
  
  IF NOT v_movie_available THEN
    RAISE EXCEPTION 'Movie not available';
  END IF;

  -- Server-side price calculation (250 per seat)
  v_expected_amount := array_length(p_seats, 1) * 250;
  IF p_total_amount != v_expected_amount THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  -- Check seat availability
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
  
  -- Use server-calculated amount, not client-provided
  INSERT INTO bookings (user_id, movie_id, seats, showtime, total_amount, payment_status)
  VALUES (p_user_id, p_movie_id, p_seats, p_showtime, v_expected_amount, 'pending')
  RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$;
