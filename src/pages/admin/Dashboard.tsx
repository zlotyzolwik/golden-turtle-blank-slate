import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Gift, MessageSquare, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  totalReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  activeVouchers: number;
  unreadMessages: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    activeTrips: 0,
    totalReservations: 0,
    pendingReservations: 0,
    totalRevenue: 0,
    activeVouchers: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch trips stats
      const { data: tripsData } = await supabase
        .from('trips')
        .select('id, is_active');

      // Fetch reservations stats
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('id, status, total_price');

      // Fetch vouchers stats
      const { data: vouchersData } = await supabase
        .from('vouchers')
        .select('id, status');

      // Fetch messages stats
      const { data: messagesData } = await supabase
        .from('contact_messages')
        .select('id, status');

      if (tripsData) {
        const totalTrips = tripsData.length;
        const activeTrips = tripsData.filter(trip => trip.is_active).length;

        setStats(prev => ({
          ...prev,
          totalTrips,
          activeTrips,
        }));
      }

      if (reservationsData) {
        const totalReservations = reservationsData.length;
        const pendingReservations = reservationsData.filter(r => r.status === 'pending').length;
        const totalRevenue = reservationsData.reduce((sum, r) => sum + (r.total_price || 0), 0);

        setStats(prev => ({
          ...prev,
          totalReservations,
          pendingReservations,
          totalRevenue,
        }));
      }

      if (vouchersData) {
        const activeVouchers = vouchersData.filter(v => v.status === 'active').length;

        setStats(prev => ({
          ...prev,
          activeVouchers,
        }));
      }

      if (messagesData) {
        const unreadMessages = messagesData.filter(m => m.status === 'new').length;

        setStats(prev => ({
          ...prev,
          unreadMessages,
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

  const dashboardCards = [
    {
      title: "Wycieczki",
      value: `${stats.activeTrips}/${stats.totalTrips}`,
      description: "Aktywne wycieczki",
      icon: MapPin,
      color: "text-blue-600",
    },
    {
      title: "Rezerwacje",
      value: stats.totalReservations.toString(),
      description: `${stats.pendingReservations} oczekujących`,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Przychody",
      value: `${stats.totalRevenue.toLocaleString('pl-PL')} PLN`,
      description: "Łączne przychody",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Vouchery",
      value: stats.activeVouchers.toString(),
      description: "Aktywne vouchery",
      icon: Gift,
      color: "text-purple-600",
    },
    {
      title: "Wiadomości",
      value: stats.unreadMessages.toString(),
      description: "Nieprzeczytane",
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Przegląd najważniejszych statystyk Twojej firmy wycieczkowej.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}