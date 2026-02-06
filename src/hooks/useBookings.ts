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

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          movie_id: movieId,
          seats,
          showtime,
          total_amount: totalAmount,
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate 90% success rate
      const isSuccess = Math.random() > 0.1;

      if (!isSuccess) {
        throw new Error("Payment failed. Please try again.");
      }

      const { data, error } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // Mock email notification via toast
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
