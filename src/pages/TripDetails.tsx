import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { MapPin, Calendar, Users, Star, ArrowLeft, Phone, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { createReservationSecure, ReservationData } from "@/utils/reservationUtils";
import { createStripePayment } from "@/utils/stripeUtils";

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationData, setReservationData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    number_of_people: 1,
    notes: ""
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać szczegółów wycieczki",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;

    try {
      const totalPrice = trip.price * reservationData.number_of_people;
      
      // Proceed directly to payment with guest reservation
      const paymentResult = await createStripePayment({
        type: 'trip_reservation',
        amount: totalPrice * 100, // Convert to cents
        currency: trip.currency,
        tripData: {
          tripId: trip.id,
          customerName: reservationData.customer_name,
          customerEmail: reservationData.customer_email,
          customerPhone: reservationData.customer_phone,
          numberOfPeople: reservationData.number_of_people,
          totalPrice: totalPrice,
          notes: reservationData.notes
        }
      });

      if (paymentResult.url) {
        // Close dialog and redirect to Stripe Checkout
        setReservationOpen(false);
        window.open(paymentResult.url, '_blank');
        return;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Błąd płatności",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia płatności",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Wycieczka nie została znaleziona</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Powrót do strony głównej
          </Button>
        </div>
      </div>
    );
  }

  const itineraryEntries = Object.entries(trip.itinerary || {});

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">WycieczkiPL</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót
            </Button>
            {user && (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Panel Admin
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-96 mt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${trip.featured_image}')` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">{trip.title}</h1>
            <div className="flex items-center text-xl mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              {trip.destination}
            </div>
            <div className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2" />
              {format(new Date(trip.departure_date), "dd MMM", { locale: pl })} - {" "}
              {format(new Date(trip.return_date), "dd MMM yyyy", { locale: pl })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Opis wycieczki</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {trip.detailed_description}
                </p>
              </CardContent>
            </Card>

            {/* Pickup Locations */}
            {trip.pickup_locations && (
              <Card>
                <CardHeader>
                  <CardTitle>Miejsca zbiórek</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {trip.pickup_locations}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {trip.gallery_images && trip.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galeria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trip.gallery_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${trip.title} - zdjęcie ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Price & Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Rezerwacja</span>
                  <Badge 
                    variant={trip.available_spots <= 10 ? "destructive" : "secondary"}
                    className={trip.available_spots <= 10 ? "bg-orange-500 text-white font-bold" : ""}
                  >
                    {trip.available_spots <= 10 
                      ? `OSTATNIE ${trip.available_spots} MIEJSC` 
                      : `${trip.available_spots} miejsc`
                    }
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {trip.price.toLocaleString('pl-PL')} {trip.currency}
                  </div>
                  <p className="text-muted-foreground">za osobę</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span>Data wyjazdu:</span>
                    <span>{format(new Date(trip.departure_date), "dd MMM yyyy", { locale: pl })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data powrotu:</span>
                    <span>{format(new Date(trip.return_date), "dd MMM yyyy", { locale: pl })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dostępne miejsca:</span>
                    <span>{trip.available_spots} z {trip.total_spots}</span>
                  </div>
                </div>

                <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={trip.available_spots === 0}
                    >
                      {trip.available_spots === 0 ? "Brak miejsc" : "Rezerwuj teraz"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Formularz rezerwacji</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReservation} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name">Imię i nazwisko</Label>
                        <Input
                          id="customer_name"
                          value={reservationData.customer_name}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            customer_name: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer_email">E-mail</Label>
                        <Input
                          id="customer_email"
                          type="email"
                          value={reservationData.customer_email}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            customer_email: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer_phone">Telefon</Label>
                        <Input
                          id="customer_phone"
                          value={reservationData.customer_phone}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            customer_phone: e.target.value
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="number_of_people">Liczba osób</Label>
                        <Input
                          id="number_of_people"
                          type="number"
                          min="1"
                          max={trip.available_spots}
                          value={reservationData.number_of_people}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            number_of_people: parseInt(e.target.value)
                          }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Dodatkowe uwagi</Label>
                        <Textarea
                          id="notes"
                          value={reservationData.notes}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between font-semibold">
                          <span>Suma:</span>
                          <span>{(trip.price * reservationData.number_of_people).toLocaleString('pl-PL')} {trip.currency}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                          required
                        />
                        <Label 
                          htmlFor="terms" 
                          className="text-sm leading-tight cursor-pointer"
                        >
                          Akceptuję{" "}
                          <Link 
                            to="/regulamin" 
                            target="_blank"
                            className="text-primary hover:underline"
                          >
                            regulamin wycieczek
                          </Link>
                          {" "}i{" "}
                          <Link 
                            to="/polityka-prywatnosci" 
                            target="_blank"
                            className="text-primary hover:underline"
                          >
                            politykę prywatności
                          </Link>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!termsAccepted}
                      >
                        Przejdź do płatności
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">514176996</p>
                    <p className="text-sm text-muted-foreground">Pn-Pt: 9:00-17:00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">kontakt@zloty-zolwik.pl</p>
                    <p className="text-sm text-muted-foreground">Odpowiadamy w 24h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;