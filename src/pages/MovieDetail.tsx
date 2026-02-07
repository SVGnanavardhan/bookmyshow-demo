import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMovie } from "@/hooks/useMovies";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, Clock, Calendar, Play, ArrowLeft, Loader2, Check, CreditCard, Minus, Plus, Users } from "lucide-react";
import { toast } from "sonner";

const SEAT_PRICE = 250; // Price per seat in INR
const SEATS = [
  ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
  ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
  ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"],
  ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
  ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"],
];

// Mock filled seats (in real app, this would come from database based on showtime)
const FILLED_SEATS = ["A3", "A4", "B5", "B6", "B7", "C2", "C3", "D4", "D5", "E1", "E8"];

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: movie, isLoading } = useMovie(id || "");
  const createBooking = useCreateBooking();
  const processPayment = useProcessPayment();

  // Get ticket count from URL or default to 1
  const initialTicketCount = parseInt(searchParams.get("tickets") || "1", 10);
  const [ticketCount, setTicketCount] = useState(Math.min(Math.max(initialTicketCount, 1), 10));

  const [showTheaterModal, setShowTheaterModal] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<{ time: string; theater: string } | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Group showtimes by theater
  const theaterShowtimes = movie?.showtimes?.reduce((acc, showtime) => {
    if (!acc[showtime.theater]) {
      acc[showtime.theater] = [];
    }
    acc[showtime.theater].push(showtime.time);
    return acc;
  }, {} as Record<string, string[]>) || {};

  // Generate random filled seats based on showtime (for demo purposes)
  const filledSeatsForShowtime = useMemo(() => {
    if (!selectedShowtime) return FILLED_SEATS;
    // Use showtime as seed for consistent filled seats per showtime
    const seed = selectedShowtime.time.length + selectedShowtime.theater.length;
    const allSeats = SEATS.flat();
    const filledCount = 8 + (seed % 8); // 8-15 filled seats
    const filled: string[] = [];
    for (let i = 0; i < filledCount; i++) {
      const index = (seed * (i + 1) * 7) % allSeats.length;
      if (!filled.includes(allSeats[index])) {
        filled.push(allSeats[index]);
      }
    }
    return filled;
  }, [selectedShowtime]);

  const handleSeatClick = (seat: string) => {
    // Don't allow selecting filled seats
    if (filledSeatsForShowtime.includes(seat)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      // Limit selection to ticket count
      if (prev.length >= ticketCount) {
        toast.error(`You can only select ${ticketCount} seat${ticketCount > 1 ? "s" : ""}`);
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please sign in to book tickets");
      navigate("/auth");
      return;
    }
    setShowTheaterModal(true);
  };

  const handleSelectShowtime = (theater: string, time: string) => {
    setSelectedShowtime({ time, theater });
    setShowTheaterModal(false);
    setShowSeatModal(true);
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
      setShowSeatModal(false);
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Ticket Count Selector */}
                    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tickets:</span>
                      <button
                        onClick={() => setTicketCount((prev) => Math.max(prev - 1, 1))}
                        className="w-8 h-8 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-foreground text-lg">
                        {ticketCount}
                      </span>
                      <button
                        onClick={() => setTicketCount((prev) => Math.min(prev + 1, 10))}
                        className="w-8 h-8 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Button onClick={handleBookNow} size="lg" className="gap-2">
                      <Play className="w-5 h-5 fill-current" />
                      Book Tickets
                    </Button>
                  </div>
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

      {/* Theater & Showtimes Modal */}
      <Dialog open={showTheaterModal} onOpenChange={setShowTheaterModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Theaters Showing {movie.title}
            </DialogTitle>
            <DialogDescription>
              Select a theater and showtime to continue booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(theaterShowtimes).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(theaterShowtimes).map(([theater, times]) => (
                  <div
                    key={theater}
                    className="bg-card rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{theater}</h3>
                        <p className="text-sm text-muted-foreground">
                          {times.length} showtime{times.length > 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {times.map((time, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleSelectShowtime(theater, time)}
                          className="px-4 py-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No showtimes available for this movie.</p>
              </div>
            )}

            {/* Legend */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">How to book:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Select a showtime from any theater above</li>
                <li>Choose your preferred seats</li>
                <li>Complete the payment</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seat Selection Modal */}
      <Dialog open={showSeatModal} onOpenChange={setShowSeatModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Seats - {movie.title}</DialogTitle>
            <DialogDescription>
              {selectedShowtime && (
                <span className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{selectedShowtime.theater}</Badge>
                  <Badge variant="outline">{selectedShowtime.time}</Badge>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Ticket Count Display */}
            <div className="bg-accent/10 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-foreground font-medium">
                  Selecting {ticketCount} seat{ticketCount > 1 ? "s" : ""}
                </span>
              </div>
              <Badge variant="secondary">
                {selectedSeats.length} / {ticketCount} selected
              </Badge>
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
                      {row.map((seat) => {
                        const isFilled = filledSeatsForShowtime.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        
                        return (
                          <button
                            key={seat}
                            onClick={() => handleSeatClick(seat)}
                            disabled={isFilled}
                            className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                              isFilled
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-primary text-primary-foreground border-2 border-primary"
                                : "bg-card border-2 border-success text-success hover:bg-success/10"
                            }`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card border-2 border-success" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted opacity-60" />
                    <span className="text-muted-foreground">Filled</span>
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
                <span className="text-muted-foreground">Theater</span>
                <span className="font-medium text-foreground">{selectedShowtime?.theater}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Showtime</span>
                <span className="font-medium text-foreground">{selectedShowtime?.time}</span>
              </div>
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSeatModal(false);
                  setSelectedSeats([]);
                  setShowTheaterModal(true);
                }}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Showtime
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length !== ticketCount || createBooking.isPending}
                className="flex-1"
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : selectedSeats.length !== ticketCount ? (
                  `Select ${ticketCount - selectedSeats.length} more seat${ticketCount - selectedSeats.length > 1 ? "s" : ""}`
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
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
