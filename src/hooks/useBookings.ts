import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Booking {
  id: string;
  user_id: string;
  movie_id: string;
  seats: string[];
  showtime: string;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  booking_code: string;
  created_at: string;
  updated_at: string;
  movie?: {
    title: string;
    poster_url: string | null;
    language: string;
  };
}

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          movie:movies(title, poster_url, language)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      movieId,
      seats,
      showtime,
      totalAmount,
    }: {
      movieId: string;
      seats: string[];
      showtime: string;
      totalAmount: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc('book_seats', {
        p_user_id: user.id,
        p_movie_id: movieId,
        p_seats: seats,
        p_showtime: showtime,
        p_total_amount: totalAmount,
      });

      if (error) {
        if (error.message.includes('already booked')) {
          throw new Error('Selected seats are no longer available. Please choose different seats.');
        }
        throw error;
      }
      return { id: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('process-payment', {
        body: { bookingId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Payment failed. Please try again.");
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || "Payment failed. Please try again.");
      }

      return result.booking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("🎬 Booking Confirmed!", {
        description: `Your booking ${data.booking_code} has been confirmed. Check your email for details.`,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error("Payment Failed", {
        description: error.message,
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });
};
