import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovie } from "@/hooks/useMovies";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, Clock, Calendar, Play, ArrowLeft, Loader2, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";

const SEAT_PRICE = 250; // Price per seat in INR
const SEATS = [
  ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
  ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
  ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"],
  ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
  ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"],
];

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: movie, isLoading } = useMovie(id || "");
  const createBooking = useCreateBooking();
  const processPayment = useProcessPayment();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<{ time: string; theater: string } | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSeatClick = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please sign in to book tickets");
      navigate("/auth");
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0 || !movie) {
      toast.error("Please select a showtime and at least one seat");
      return;
    }

    try {
      const showtimeDate = new Date();
      const [hours, minutes] = selectedShowtime.time.replace(/[AP]M/i, "").trim().split(":");
      const isPM = selectedShowtime.time.toLowerCase().includes("pm");
      showtimeDate.setHours(
        isPM && hours !== "12" ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes) || 0
      );

      const booking = await createBooking.mutateAsync({
        movieId: movie.id,
        seats: selectedSeats,
        showtime: showtimeDate.toISOString(),
        totalAmount: selectedSeats.length * SEAT_PRICE,
      });

      setCurrentBookingId(booking.id);
      setShowBookingModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };

  const handleProcessPayment = async () => {
    if (!currentBookingId) return;

    setIsProcessingPayment(true);
    try {
      await processPayment.mutateAsync(currentBookingId);
      setShowPaymentModal(false);
      setSelectedSeats([]);
      setSelectedShowtime(null);
      setCurrentBookingId(null);
      navigate("/bookings");
    } catch (error) {
      // Error already handled in mutation
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Movie not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[120px] md:pt-[100px]">
        {/* Hero Section */}
        <section
          className="relative h-[50vh] min-h-[400px] overflow-hidden"
          style={{
            backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <div className="relative container mx-auto h-full flex items-end pb-8 px-4">
            <button
              onClick={() => navigate("/")}
              className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="flex gap-6 items-end">
              <img
                src={movie.poster_url || "/placeholder.svg"}
                alt={movie.title}
                className="w-40 h-60 object-cover rounded-lg shadow-card hidden md:block"
              />
              
              <div className="animate-slide-in">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">{movie.rating}/10</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{movie.duration_minutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "TBA"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genre.map((g) => (
                    <Badge key={g} variant="secondary">{g}</Badge>
                  ))}
                  <Badge variant="outline">{movie.language}</Badge>
                </div>

                {movie.is_available && (
                  <Button onClick={handleBookNow} size="lg" className="gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Book Tickets
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">About the movie</h2>
          <p className="text-muted-foreground max-w-3xl">{movie.description}</p>
        </section>

        {/* Showtimes */}
        {movie.is_available && movie.showtimes.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Showtimes</h2>
            <div className="flex flex-wrap gap-3">
              {movie.showtimes.map((showtime, index) => (
                <div
                  key={index}
                  className="px-4 py-3 rounded-lg bg-card border border-border"
                >
                  <p className="font-semibold text-foreground">{showtime.time}</p>
                  <p className="text-sm text-muted-foreground">{showtime.theater}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Tickets - {movie.title}</DialogTitle>
            <DialogDescription>Select your showtime and seats</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Showtime Selection */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Select Showtime</h3>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.map((showtime, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedShowtime(showtime)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedShowtime?.time === showtime.time
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-border hover:border-primary"
                    }`}
                  >
                    <p className="font-medium">{showtime.time}</p>
                    <p className="text-xs opacity-80">{showtime.theater}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Selection */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Select Seats</h3>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="w-full h-2 bg-primary/50 rounded mb-6 mx-auto max-w-xs" />
                <p className="text-center text-xs text-muted-foreground mb-4">SCREEN</p>
                
                <div className="space-y-2">
                  {SEATS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                      {row.map((seat) => (
                        <button
                          key={seat}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                            selectedSeats.includes(seat)
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border hover:border-primary"
                          }`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card border border-border" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary" />
                    <span className="text-muted-foreground">Selected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Selected Seats</span>
                <span className="font-medium text-foreground">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Price per seat</span>
                <span className="text-foreground">₹{SEAT_PRICE}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="font-bold text-primary text-lg">
                  ₹{selectedSeats.length * SEAT_PRICE}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirmBooking}
              disabled={!selectedShowtime || selectedSeats.length === 0 || createBooking.isPending}
              className="w-full"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>Secure payment simulation</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Mock Payment</p>
                  <p className="text-sm text-muted-foreground">No real charges will be made</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-foreground">{selectedSeats.join(", ")}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary">₹{selectedSeats.length * SEAT_PRICE}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
              className="w-full"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Pay ₹{selectedSeats.length * SEAT_PRICE}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieDetail;
