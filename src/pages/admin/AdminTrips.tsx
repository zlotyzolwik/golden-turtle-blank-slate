import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trips";
import { Plus, Search, Edit2, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać wycieczek.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      setTrips(trips.filter(trip => trip.id !== tripId));
      toast({
        title: "Sukces",
        description: "Wycieczka została usunięta.",
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć wycieczki.",
        variant: "destructive",
      });
    }
  };

  const toggleTripStatus = async (trip: Trip) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ is_active: !trip.is_active })
        .eq('id', trip.id);

      if (error) throw error;

      setTrips(trips.map(t => 
        t.id === trip.id ? { ...t, is_active: !trip.is_active } : t
      ));

      toast({
        title: "Sukces",
        description: `Wycieczka została ${!trip.is_active ? 'aktywowana' : 'dezaktywowana'}.`,
      });
    } catch (error) {
      console.error('Error toggling trip status:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu wycieczki.",
        variant: "destructive",
      });
    }
  };

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wycieczki</h2>
          <p className="text-muted-foreground">Zarządzaj ofertą wycieczek.</p>
        </div>
        <Button onClick={() => navigate('/admin/trips/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj wycieczkę
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj wycieczek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={trip.featured_image || "/placeholder.svg"}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
              <Badge
                className={`absolute top-2 right-2 ${
                  trip.is_active ? 'bg-green-600' : 'bg-gray-500'
                }`}
              >
                {trip.is_active ? 'Aktywna' : 'Nieaktywna'}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {trip.destination} • {trip.price} {trip.currency}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span>Miejsca: {trip.available_spots}/{trip.total_spots}</span>
                <span>{new Date(trip.departure_date).toLocaleDateString('pl-PL')}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/admin/trips/edit/${trip.id}`)}
                  size="sm"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edytuj
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/trip/${trip.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Zobacz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleTripStatus(trip)}>
                      {trip.is_active ? (
                        <>
                          <span className="mr-2 h-4 w-4 rounded-full bg-gray-500 inline-block" />
                          Dezaktywuj
                        </>
                      ) : (
                        <>
                          <span className="mr-2 h-4 w-4 rounded-full bg-green-600 inline-block" />
                          Aktywuj
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Usuń wycieczkę</AlertDialogTitle>
                          <AlertDialogDescription>
                            Czy na pewno chcesz usunąć tę wycieczkę? Ta akcja nie może być cofnięta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTrip(trip.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Nie znaleziono wycieczek pasujących do wyszukiwania." : "Brak wycieczek."}
          </p>
        </div>
      )}
    </div>
  );
}