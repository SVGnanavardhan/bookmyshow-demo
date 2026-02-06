import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting movie availability update...');

    // Get movies that have passed release dates and are not yet available
    const today = new Date().toISOString().split('T')[0];
    
    const { data: moviestoUpdate, error: fetchError } = await supabase
      .from('movies')
      .select('id, title, release_date')
      .eq('is_available', false)
      .lte('release_date', today);

    if (fetchError) {
      console.error('Error fetching movies:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${moviestoUpdate?.length || 0} movies to update`);

    if (moviestoUpdate && moviestoUpdate.length > 0) {
      // Update movies to available and add default showtimes
      const defaultShowtimes = [
        { time: '10:00 AM', theater: 'PVR Cinemas' },
        { time: '02:00 PM', theater: 'INOX' },
        { time: '06:00 PM', theater: 'Cinepolis' },
        { time: '09:30 PM', theater: 'PVR Cinemas' },
      ];

      for (const movie of moviestoUpdate) {
        const { error: updateError } = await supabase
          .from('movies')
          .update({ 
            is_available: true,
            showtimes: defaultShowtimes 
          })
          .eq('id', movie.id);

        if (updateError) {
          console.error(`Error updating movie ${movie.title}:`, updateError);
        } else {
          console.log(`Updated movie: ${movie.title} - now available`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${moviestoUpdate?.length || 0} movies`,
        movies: moviestoUpdate?.map(m => m.title) || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in update-movie-availability:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
