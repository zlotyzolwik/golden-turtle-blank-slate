import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Reservation } from "@/types/trips";
import { Search, Eye, CheckCircle, XCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddReservationForm from "@/components/admin/AddReservationForm";
import { PaymentRepairTool } from "@/components/admin/PaymentRepairTool";

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();

    // Set up real-time subscription for reservations
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('Reservation updated in real-time:', payload);
          fetchReservations(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, trips(title, destination, departure_date, return_date)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać rezerwacji.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, status: string, paymentStatus?: string) => {
    try {
      const updateData: any = { status };
      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
        // Auto-confirm when payment is marked as paid
        if (paymentStatus === 'paid' && status === 'pending') {
          updateData.status = 'confirmed';
        }
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(reservations.map(r => 
        r.id === reservationId 
          ? { 
              ...r, 
              status: updateData.status, 
              ...(paymentStatus && { payment_status: paymentStatus }) 
            }
          : r
      ));

      toast({
        title: "Sukces",
        description: "Status rezerwacji został zaktualizowany.",
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu.",
        variant: "destructive",
      });
    }
  };

  const filteredReservations = reservations.filter(reservation =>
    reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string, paymentStatus: string) => {
    const statusConfig = {
      pending: { label: "Oczekująca", className: "bg-yellow-500" },
      confirmed: { label: "Potwierdzona", className: "bg-green-500" },
      cancelled: { label: "Anulowana", className: "bg-red-500" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      className: "bg-gray-500" 
    };
    
    // Add checkmark for paid reservations
    const icon = paymentStatus === 'paid' ? <CheckCircle className="w-3 h-3 ml-1" /> : null;
    
    return (
      <Badge className={config.className}>
        <span className="flex items-center">
          {config.label}
          {icon}
        </span>
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Oczekuje", className: "bg-yellow-500" },
      paid: { label: "Opłacona", className: "bg-green-500" },
      failed: { label: "Niepowodzenie", className: "bg-red-500" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      className: "bg-gray-500" 
    };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rezerwacje</h2>
        <p className="text-muted-foreground">Zarządzaj rezerwacjami klientów.</p>
      </div>

      <PaymentRepairTool onComplete={fetchReservations} />

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj rezerwacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj rezerwację
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{reservation.customer_email}</p>
                  {reservation.trips && (
                    <div className="mt-2 p-2 bg-muted rounded">
                      <p className="text-sm font-medium text-primary">{reservation.trips.title}</p>
                      <p className="text-xs text-muted-foreground">{reservation.trips.destination}</p>
                      {reservation.trips.departure_date && reservation.trips.return_date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(reservation.trips.departure_date).toLocaleDateString('pl-PL')} - {new Date(reservation.trips.return_date).toLocaleDateString('pl-PL')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge(reservation.status, reservation.payment_status)}
                  {getPaymentStatusBadge(reservation.payment_status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Liczba osób</p>
                  <p className="text-sm text-muted-foreground">{reservation.number_of_people}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Wartość</p>
                  <p className="text-sm text-muted-foreground">{reservation.total_price} PLN</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Data rezerwacji</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(reservation.created_at).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telefon</p>
                  <p className="text-sm text-muted-foreground">{reservation.customer_phone || 'Brak'}</p>
                </div>
              </div>

              {reservation.voucher_code_used && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Użyty voucher</p>
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    {reservation.voucher_code_used}
                  </p>
                </div>
              )}

              {reservation.notes && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Uwagi</p>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {reservation.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Select
                  value={reservation.status}
                  onValueChange={(status) => updateReservationStatus(reservation.id, status)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Oczekująca</SelectItem>
                    <SelectItem value="confirmed">Potwierdzona</SelectItem>
                    <SelectItem value="cancelled">Anulowana</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={reservation.payment_status}
                  onValueChange={(paymentStatus) => 
                    updateReservationStatus(reservation.id, reservation.status, paymentStatus)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Oczekuje</SelectItem>
                    <SelectItem value="paid">Opłacona</SelectItem>
                    <SelectItem value="failed">Niepowodzenie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Nie znaleziono rezerwacji pasujących do wyszukiwania." : "Brak rezerwacji."}
          </p>
        </div>
      )}

      <AddReservationForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm}
        onSuccess={fetchReservations}
      />
    </div>
  );
}