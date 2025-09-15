import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Users, CreditCard, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTripParticipantsPDF, type TripPDFData, type ParticipantData } from '@/utils/pdfUtils';

interface TripWithReservations {
  id: string;
  title: string;
  destination: string;
  departure_date: string;
  return_date: string;
  price: number;
  total_spots: number;
  available_spots: number;
  reservations: Array<{
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    number_of_people: number;
    total_price: number;
    status: string;
    payment_status: string;
    created_at: string;
    stripe_payment_intent_id?: string;
  }>;
}

const AdminTripReservations = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<TripWithReservations | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (tripId) {
      fetchTripWithReservations();
    }
  }, [tripId]);

  const fetchTripWithReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          reservations (
            id,
            customer_name,
            customer_email,
            customer_phone,
            number_of_people,
            total_price,
            status,
            payment_status,
            created_at,
            stripe_payment_intent_id
          )
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip reservations:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych wycieczki.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = trip?.reservations?.filter(reservation => {
    const matchesSearch = reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reservation.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'paid' && reservation.payment_status === 'paid') ||
                         (filterStatus === 'pending' && reservation.payment_status === 'pending');
    
    return matchesSearch && matchesFilter;
  }) || [];

  const generatePDF = () => {
    if (!trip) return;

    const participants: ParticipantData[] = filteredReservations.map(reservation => ({
      customerName: reservation.customer_name,
      customerEmail: reservation.customer_email,
      customerPhone: reservation.customer_phone,
      numberOfPeople: reservation.number_of_people,
      totalPrice: reservation.total_price,
      paymentStatus: reservation.payment_status,
      createdAt: reservation.created_at
    }));

    const totalRevenue = filteredReservations
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + r.total_price, 0);

    const totalParticipants = filteredReservations.reduce((sum, r) => sum + r.number_of_people, 0);
    const paidParticipants = filteredReservations
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + r.number_of_people, 0);

    const pdfData: TripPDFData = {
      tripTitle: trip.title,
      destination: trip.destination,
      departureDate: new Date(trip.departure_date).toLocaleDateString('pl-PL'),
      returnDate: new Date(trip.return_date).toLocaleDateString('pl-PL'),
      participants,
      totalRevenue,
      totalParticipants,
      paidParticipants
    };

    generateTripParticipantsPDF(pdfData);
    
    toast({
      title: "PDF wygenerowany",
      description: "Lista uczestników została pobrana.",
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Opłacona</Badge>;
      case 'pending':
        return <Badge variant="secondary">Oczekująca</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Anulowana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Potwierdzona</Badge>;
      case 'pending':
        return <Badge variant="secondary">Oczekująca</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Anulowana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie znaleziono wycieczki.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/trips">Wróć do listy wycieczek</Link>
        </Button>
      </div>
    );
  }

  const totalRevenue = filteredReservations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.total_price, 0);

  const totalParticipants = filteredReservations.reduce((sum, r) => sum + r.number_of_people, 0);
  const paidParticipants = filteredReservations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.number_of_people, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/trips">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć do wycieczek
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-muted-foreground flex items-center space-x-4">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {trip.destination}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(trip.departure_date).toLocaleDateString('pl-PL')} - {new Date(trip.return_date).toLocaleDateString('pl-PL')}
              </span>
            </p>
          </div>
        </div>
        <Button onClick={generatePDF} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Pobierz PDF</span>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Uczestnicy</p>
                <p className="text-2xl font-bold">{totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Opłaceni</p>
                <p className="text-2xl font-bold text-green-600">{paidParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Oczekujący</p>
                <p className="text-2xl font-bold text-orange-600">{totalParticipants - paidParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Przychód</p>
              <p className="text-2xl font-bold text-primary">{totalRevenue.toFixed(2)} PLN</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry i wyszukiwanie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Szukaj po imieniu lub emailu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Wszystkie
              </Button>
              <Button
                variant={filterStatus === 'paid' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('paid')}
                size="sm"
              >
                Opłacone
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Oczekujące
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'Nie znaleziono rezerwacji pasujących do kryteriów wyszukiwania.' : 'Brak rezerwacji dla tej wycieczki.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold">{reservation.customer_name}</h3>
                      {getPaymentStatusBadge(reservation.payment_status)}
                      {getStatusBadge(reservation.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Email: {reservation.customer_email}</p>
                      {reservation.customer_phone && (
                        <p>Telefon: {reservation.customer_phone}</p>
                      )}
                      <p>Data rezerwacji: {new Date(reservation.created_at).toLocaleDateString('pl-PL')}</p>
                      {reservation.stripe_payment_intent_id && (
                        <p className="font-mono text-xs">ID płatności: {reservation.stripe_payment_intent_id}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Liczba osób</p>
                      <p className="text-lg font-semibold">{reservation.number_of_people}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cena całkowita</p>
                      <p className="text-lg font-bold text-primary">{reservation.total_price.toFixed(2)} PLN</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTripReservations;