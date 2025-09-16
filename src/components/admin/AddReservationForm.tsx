import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trip } from "@/types/trips";

const reservationSchema = z.object({
  trip_id: z.string().min(1, "Wybierz wycieczkę"),
  customer_name: z.string().min(1, "Imię i nazwisko są wymagane"),
  customer_email: z.string().email("Nieprawidłowy adres email"),
  customer_phone: z.string().optional(),
  number_of_people: z.number().min(1, "Liczba osób musi być większa od 0"),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface AddReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddReservationForm({ open, onOpenChange, onSuccess }: AddReservationFormProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      number_of_people: 1,
    },
  });

  useEffect(() => {
    if (open) {
      fetchTrips();
    }
  }, [open]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('is_active', true)
        .gt('available_spots', 0)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy wycieczek.",
        variant: "destructive",
      });
    }
  };

  const handleTripSelect = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    setSelectedTrip(trip || null);
    form.setValue('trip_id', tripId);
  };

  const calculateTotalPrice = () => {
    if (!selectedTrip) return 0;
    return selectedTrip.price * form.watch('number_of_people');
  };

  const sendConfirmationEmails = async (reservationData: any, tripData: Trip) => {
    try {
      await supabase.functions.invoke('send-smtp-email', {
        body: {
          type: 'reservation',
          customerName: reservationData.customer_name,
          customerEmail: reservationData.customer_email,
          details: {
            tripTitle: tripData.title,
            tripDestination: tripData.destination,
            departureDate: tripData.departure_date,
            returnDate: tripData.return_date,
            numberOfPeople: reservationData.number_of_people,
            totalPrice: calculateTotalPrice(),
            reservationId: reservationData.id,
          }
        },
      });
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      // Don't fail the whole operation if email fails
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!selectedTrip) {
      toast({
        title: "Błąd",
        description: "Wybierz wycieczkę.",
        variant: "destructive",
      });
      return;
    }

    if (data.number_of_people > selectedTrip.available_spots) {
      toast({
        title: "Błąd",
        description: `Dostępne jest tylko ${selectedTrip.available_spots} miejsc.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const totalPrice = calculateTotalPrice();

      // Create reservation using guest function (works for admin)
      const { data: result, error } = await supabase.rpc('create_reservation_guest', {
        p_trip_id: data.trip_id,
        p_customer_email: data.customer_email,
        p_customer_name: data.customer_name,
        p_total_price: totalPrice,
        p_customer_phone: data.customer_phone || null,
        p_number_of_people: data.number_of_people,
        p_notes: data.notes || null,
      });

      if (error) throw error;

      if (result && result.length > 0 && result[0].success) {
        // Send confirmation emails
        await sendConfirmationEmails({
          id: result[0].reservation_id,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          number_of_people: data.number_of_people,
        }, selectedTrip);

        toast({
          title: "Sukces",
          description: "Rezerwacja została utworzona pomyślnie.",
        });

        form.reset();
        setSelectedTrip(null);
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error(result?.[0]?.message || "Nie udało się utworzyć rezerwacji");
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się utworzyć rezerwacji.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj rezerwację</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Wycieczka</Label>
            <Select onValueChange={handleTripSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz wycieczkę" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.title} - {trip.destination} ({trip.available_spots} miejsc)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.trip_id && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.trip_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_name">Imię i nazwisko</Label>
            <Input
              id="customer_name"
              {...form.register("customer_name")}
              placeholder="Jan Kowalski"
            />
            {form.formState.errors.customer_name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.customer_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_email">Email</Label>
            <Input
              id="customer_email"
              type="email"
              {...form.register("customer_email")}
              placeholder="jan@example.com"
            />
            {form.formState.errors.customer_email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.customer_email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_phone">Telefon (opcjonalne)</Label>
            <Input
              id="customer_phone"
              {...form.register("customer_phone")}
              placeholder="123 456 789"
            />
          </div>

          <div>
            <Label htmlFor="number_of_people">Liczba osób</Label>
            <Input
              id="number_of_people"
              type="number"
              min="1"
              max={selectedTrip?.available_spots || 1}
              {...form.register("number_of_people", { valueAsNumber: true })}
            />
            {form.formState.errors.number_of_people && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.number_of_people.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Uwagi (opcjonalne)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Dodatkowe informacje..."
              rows={3}
            />
          </div>

          {selectedTrip && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Podsumowanie:</p>
              <p className="text-sm">Cena za osobę: {selectedTrip.price} PLN</p>
              <p className="text-sm">Liczba osób: {form.watch('number_of_people')}</p>
              <p className="text-sm font-bold">Całkowita cena: {calculateTotalPrice()} PLN</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Dodawanie..." : "Dodaj rezerwację"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}