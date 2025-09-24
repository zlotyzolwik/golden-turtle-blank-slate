import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserReservations } from "@/utils/reservationUtils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import Brand from "@/components/Brand";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";

interface ReservationWithTrip {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  number_of_people: number;
  total_price: number;
  status: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  trips: {
    title: string;
    destination: string;
    departure_date: string;
    return_date: string;
  };
}

const MyReservations = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<ReservationWithTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, [user, navigate]);

  const fetchReservations = async () => {
    try {
      const result = await getUserReservations();
      if (result.success) {
        setReservations(result.data as ReservationWithTrip[]);
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać rezerwacji. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Oczekująca", variant: "secondary" as const },
      confirmed: { label: "Potwierdzona", variant: "default" as const },
      cancelled: { label: "Anulowana", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: "secondary" as const
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Oczekuje płatności", variant: "secondary" as const },
      paid: { label: "Opłacona", variant: "default" as const },
      failed: { label: "Błąd płatności", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: "secondary" as const
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Ładowanie rezerwacji...</p>
        </div>
      </div>
    );
  }

  const reservationsStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Moje Rezerwacje - Złoty Żółwik",
    "description": "Zobacz wszystkie swoje rezerwacje wycieczek i śledź ich status",
    "url": "https://zloty-zolwik.pl/my-reservations",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Złoty Żółwik",
      "url": "https://zloty-zolwik.pl"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <SEOHead 
        title="Moje Rezerwacje - Złoty Żółwik"
        description="Zobacz wszystkie swoje rezerwacje wycieczek i śledź ich status"
        canonicalUrl="https://zloty-zolwik.pl/my-reservations"
        structuredData={reservationsStructuredData}
      />
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Brand />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Strona główna
            </Button>
            <Button variant="ghost" onClick={() => navigate('/vouchers')}>Vouchery</Button>
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate('/admin')}>
                    Panel Admin
                  </Button>
                )}
                <Button variant="outline" onClick={() => signOut()}>
                  Wyloguj
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Zaloguj się
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Moje Rezerwacje</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Zobacz wszystkie swoje rezerwacje wycieczek i śledź ich status.
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-6">
                Nie masz jeszcze żadnych rezerwacji.
              </p>
              <Button onClick={() => navigate('/')} size="lg">
                Przeglądaj wycieczki
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {reservation.trips.title}
                        </CardTitle>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          {reservation.trips.destination}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(reservation.trips.departure_date), "dd MMM", { locale: pl })} - {" "}
                          {format(new Date(reservation.trips.return_date), "dd MMM yyyy", { locale: pl })}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(reservation.status)}
                        {getPaymentStatusBadge(reservation.payment_status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Liczba osób</p>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{reservation.number_of_people}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Wartość</p>
                        <p className="text-lg font-bold text-primary">
                          {reservation.total_price.toLocaleString('pl-PL')} PLN
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Data rezerwacji</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reservation.created_at), "dd MMM yyyy, HH:mm", { locale: pl })}
                        </p>
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Dodatkowe uwagi</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {reservation.notes}
                        </p>
                      </div>
                    )}

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Dane kontaktowe</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Imię:</span> {reservation.customer_name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {reservation.customer_email}
                        </div>
                        {reservation.customer_phone && (
                          <div>
                            <span className="font-medium">Telefon:</span> {reservation.customer_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyReservations;