import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trips";
import AdminTripForm from "@/components/admin/AdminTripForm";
import { useToast } from "@/hooks/use-toast";

export default function AdminTripEdit() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        description: "Nie udało się pobrać wycieczki.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie znaleziono wycieczki.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edytuj wycieczkę</h2>
        <p className="text-muted-foreground">Modyfikuj szczegóły wycieczki "{trip.title}".</p>
      </div>
      
      <AdminTripForm trip={trip} />
    </div>
  );
}