import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Ticket, Calendar, MapPin, ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";

const Bookings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: bookings, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "refunded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[140px] md:pt-[120px] pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                My Bookings
              </h1>
              <p className="text-muted-foreground">View and manage your movie bookings</p>
            </div>
          </div>

          {/* Bookings List */}
          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-16">
              <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">
                Start by booking tickets to your favorite movies!
              </p>
              <Button onClick={() => navigate("/")}>Browse Movies</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="bg-card border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Movie Poster */}
                      <div className="w-full md:w-32 h-40 md:h-auto flex-shrink-0">
                        <img
                          src={booking.movie?.poster_url || "/placeholder.svg"}
                          alt={booking.movie?.title || "Movie"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {booking.movie?.title || "Unknown Movie"}
                              </h3>
                              <Badge className={getStatusColor(booking.payment_status)}>
                                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(new Date(booking.showtime), "PPP 'at' p")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>Seats: {booking.seats.join(", ")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-primary" />
                                <span className="font-mono text-foreground">{booking.booking_code}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <p className="text-2xl font-bold text-primary">
                              ₹{booking.total_amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Booked on {format(new Date(booking.created_at), "PP")}
                            </p>
                            
                            {booking.payment_status === "pending" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelBooking.mutate(booking.id)}
                                disabled={cancelBooking.isPending}
                              >
                                {cancelBooking.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Bookings;
