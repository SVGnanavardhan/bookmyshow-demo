import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const adminCheck = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminCheck
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Movie availability update triggered');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];
    
    const { data: moviesToUpdate, error: fetchError } = await supabase
      .from('movies')
      .select('id, title, release_date')
      .eq('is_available', false)
      .lte('release_date', today);

    if (fetchError) {
      console.error('Error fetching movies:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${moviesToUpdate?.length || 0} movies to update`);

    if (moviesToUpdate && moviesToUpdate.length > 0) {
      const defaultShowtimes = [
        { time: '10:00 AM', theater: 'PVR Cinemas' },
        { time: '02:00 PM', theater: 'INOX' },
        { time: '06:00 PM', theater: 'Cinepolis' },
        { time: '09:30 PM', theater: 'PVR Cinemas' },
      ];

      for (const movie of moviesToUpdate) {
        const { error: updateError } = await supabase
          .from('movies')
          .update({ 
            is_available: true,
            showtimes: defaultShowtimes 
          })
          .eq('id', movie.id);

        if (updateError) {
          console.error('Error updating movie');
        } else {
          console.log('Movie updated successfully');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${moviesToUpdate?.length || 0} movies`,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Movie availability update failed');
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
