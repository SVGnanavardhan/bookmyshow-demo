import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  genre: string[];
  language: string;
  rating: number;
  duration_minutes: number;
  release_date: string | null;
  is_available: boolean;
  showtimes: { time: string; theater: string }[];
  created_at: string;
  updated_at: string;
}

export const useMovies = () => {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useAvailableMovies = () => {
  return useQuery({
    queryKey: ["movies", "available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("is_available", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useUpcomingMovies = () => {
  return useQuery({
    queryKey: ["movies", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("is_available", false)
        .order("release_date", { ascending: true });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ["movies", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Movie | null;
    },
    enabled: !!id,
  });
};
