
-- Add admin-only write policies for movies table
CREATE POLICY "Only admins can insert movies"
ON public.movies
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update movies"
ON public.movies
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete movies"
ON public.movies
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
