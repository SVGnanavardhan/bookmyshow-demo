import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMovie } from "@/hooks/useMovies";
import { useProcessPayment } from "@/hooks/useBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Smartphone, 
  ArrowLeft, 
  Loader2, 
  Check, 
  Film,
  Clock,
  MapPin,
  Armchair,
  Shield,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const SEAT_PRICE = 250;

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const processPayment = useProcessPayment();

  // Get booking details from URL params
  const movieId = searchParams.get("movieId") || "";
  const bookingId = searchParams.get("bookingId") || "";
  const seats = searchParams.get("seats")?.split(",") || [];
  const theater = searchParams.get("theater") || "";
  const showtime = searchParams.get("showtime") || "";
  
  const { data: movie, isLoading: movieLoading } = useMovie(movieId);
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [cardType, setCardType] = useState<"debit" | "credit">("debit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // UPI form state
  const [upiId, setUpiId] = useState("");

  const totalAmount = seats.length * SEAT_PRICE;

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to complete payment");
      navigate("/auth");
    }
    if (!bookingId || !movieId || seats.length === 0) {
      toast.error("Invalid booking details");
      navigate("/");
    }
  }, [user, bookingId, movieId, seats, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, "").length < 16) {
      toast.error("Please enter a valid card number");
      return false;
    }
    if (!cardName.trim()) {
      toast.error("Please enter the cardholder name");
      return false;
    }
    if (cardExpiry.length < 5) {
      toast.error("Please enter a valid expiry date");
      return false;
    }
    if (cardCvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return false;
    }
    return true;
  };

  const validateUPI = () => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId)) {
      toast.error("Please enter a valid UPI ID (e.g., name@upi)");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (paymentMethod === "card" && !validateCard()) return;
    if (paymentMethod === "upi" && !validateUPI()) return;

    setIsProcessing(true);
    
    try {
      await processPayment.mutateAsync(bookingId);
      setPaymentComplete(true);
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewBookings = () => {
    navigate("/bookings");
  };

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[120px] md:pt-[100px] pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border-success/30 bg-gradient-to-b from-success/5 to-background">
              <CardContent className="pt-10 pb-8 text-center">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                
                <h1 className="text-3xl font-display font-bold text-foreground mb-3">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-8">
                  Your booking has been confirmed. Check your email for the ticket details.
                </p>

                <div className="bg-card rounded-xl p-6 border border-border mb-8 text-left">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Booking Receipt
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Movie</span>
                      <span className="text-foreground font-medium">{movie?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Theater</span>
                      <span className="text-foreground">{theater}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Showtime</span>
                      <span className="text-foreground">{showtime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="text-foreground">{seats.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="text-foreground">
                        {paymentMethod === "card" ? `${cardType === "debit" ? "Debit" : "Credit"} Card` : "UPI"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="font-semibold text-foreground">Amount Paid</span>
                      <span className="font-bold text-success text-lg">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleViewBookings} size="lg" className="w-full">
                  View My Bookings
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[120px] md:pt-[100px] pb-20">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to seat selection
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                  Complete Payment
                </h1>
                <p className="text-muted-foreground">
                  Choose your preferred payment method to complete booking
                </p>
              </div>

              <Tabs defaultValue="card" onValueChange={(v) => setPaymentMethod(v as "card" | "upi")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Card Payment
                  </TabsTrigger>
                  <TabsTrigger value="upi" className="gap-2">
                    <Smartphone className="w-4 h-4" />
                    UPI
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Card Details</CardTitle>
                      <CardDescription>
                        Enter your debit or credit card information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Card Type Selection */}
                      <div className="space-y-3">
                        <Label>Card Type</Label>
                        <RadioGroup 
                          value={cardType} 
                          onValueChange={(v) => setCardType(v as "debit" | "credit")}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="debit" id="debit" />
                            <Label htmlFor="debit" className="cursor-pointer">Debit Card</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="credit" id="credit" />
                            <Label htmlFor="credit" className="cursor-pointer">Credit Card</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Card Number */}
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                        />
                      </div>

                      {/* Cardholder Name */}
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="Name on card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Expiry Date</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            type="password"
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="upi" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">UPI Payment</CardTitle>
                      <CardDescription>
                        Pay using your UPI ID for instant payment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Example: name@okicici, name@ybl, name@paytm
                        </p>
                      </div>

                      <div className="bg-secondary/50 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-success" />
                          Secure UPI Payment
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          You'll receive a payment request on your UPI app. Approve the request to complete the payment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Security Note */}
              <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Summary - Right Side */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Movie Info */}
                  <div className="flex gap-4">
                    <img
                      src={movie?.poster_url || "/placeholder.svg"}
                      alt={movie?.title}
                      className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{movie?.title}</h3>
                      <Badge variant="outline" className="mt-1">{movie?.language}</Badge>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {movie?.genre.slice(0, 2).map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{theater}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-foreground">{showtime}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Armchair className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground">{seats.length} Ticket{seats.length > 1 ? "s" : ""}</p>
                        <p className="text-muted-foreground">{seats.join(", ")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tickets ({seats.length} x ₹{SEAT_PRICE})</span>
                      <span className="text-foreground">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Convenience Fee</span>
                      <span className="text-success">FREE</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total Amount</span>
                      <span className="font-bold text-primary text-xl">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Pay ₹{totalAmount}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
