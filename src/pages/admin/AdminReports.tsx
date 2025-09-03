import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MapPin, Euro } from "lucide-react";

interface MonthlyData {
  month: string;
  reservations: number;
  revenue: number;
}

interface DestinationData {
  destination: string;
  bookings: number;
  revenue: number;
}

export default function AdminReports() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [destinationData, setDestinationData] = useState<DestinationData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    avgReservationValue: 0,
    activeTrips: 0,
  });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      // Fetch reservations with trip data for analysis
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          *,
          trips (title, destination, price)
        `)
        .order('created_at', { ascending: true });

      // Fetch active trips count
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('is_active', true);

      if (reservationsData) {
        // Calculate monthly data
        const monthlyStats: { [key: string]: { reservations: number; revenue: number } } = {};
        
        reservationsData.forEach(reservation => {
          const month = new Date(reservation.created_at).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit'
          });
          
          if (!monthlyStats[month]) {
            monthlyStats[month] = { reservations: 0, revenue: 0 };
          }
          
          monthlyStats[month].reservations += 1;
          monthlyStats[month].revenue += reservation.total_price || 0;
        });

        const monthlyArray = Object.entries(monthlyStats).map(([month, data]) => ({
          month,
          reservations: data.reservations,
          revenue: data.revenue,
        }));

        setMonthlyData(monthlyArray);

        // Calculate destination data
        const destinationStats: { [key: string]: { bookings: number; revenue: number } } = {};
        
        reservationsData.forEach(reservation => {
          const destination = reservation.trips?.destination || 'Nieznane';
          
          if (!destinationStats[destination]) {
            destinationStats[destination] = { bookings: 0, revenue: 0 };
          }
          
          destinationStats[destination].bookings += reservation.number_of_people;
          destinationStats[destination].revenue += reservation.total_price || 0;
        });

        const destinationArray = Object.entries(destinationStats).map(([destination, data]) => ({
          destination,
          bookings: data.bookings,
          revenue: data.revenue,
        }));

        setDestinationData(destinationArray);

        // Calculate total stats
        const totalReservations = reservationsData.length;
        const totalRevenue = reservationsData.reduce((sum, r) => sum + (r.total_price || 0), 0);
        const avgReservationValue = totalReservations > 0 ? totalRevenue / totalReservations : 0;

        setTotalStats({
          totalReservations,
          totalRevenue,
          avgReservationValue,
          activeTrips: tripsData?.length || 0,
        });
      }

    } catch (error) {
      console.error('Error fetching reports data:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Raporty</h2>
        <p className="text-muted-foreground">Analizy sprzedaży i trendów biznesowych.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączne rezerwacje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              Wszystkie rezerwacje
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączny przychód</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalRevenue.toLocaleString('pl-PL')} PLN
            </div>
            <p className="text-xs text-muted-foreground">
              Całkowita wartość sprzedaży
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średnia wartość rezerwacji</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.avgReservationValue.toLocaleString('pl-PL', { 
                maximumFractionDigits: 0 
              })} PLN
            </div>
            <p className="text-xs text-muted-foreground">
              Średnia na rezerwację
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne wycieczki</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeTrips}</div>
            <p className="text-xs text-muted-foreground">
              Dostępne w ofercie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rezerwacje miesięcznie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reservations" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Przychody miesięcznie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} PLN`, 'Przychód']} />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Destination Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popularne destynacje (liczba osób)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={destinationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ destination, percent }) => 
                    `${destination} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="bookings"
                >
                  {destinationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Przychody według destynacji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {destinationData
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((destination, index) => (
                  <div key={destination.destination} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{destination.destination}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {destination.revenue.toLocaleString('pl-PL')} PLN
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {destination.bookings} osób
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}