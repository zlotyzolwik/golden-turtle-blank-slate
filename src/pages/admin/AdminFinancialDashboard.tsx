import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, DollarSign, Users, Gift, MapPin, Download } from 'lucide-react';
import { generateFinancialReportPDF } from '@/utils/pdfUtils';

interface FinancialStats {
  totalRevenue: number;
  tripRevenue: number;
  voucherRevenue: number;
  totalReservations: number;
  paidReservations: number;
  totalVouchers: number;
  monthlyData: Array<{
    month: string;
    tripRevenue: number;
    voucherRevenue: number;
    totalRevenue: number;
  }>;
  topTrips: Array<{
    id: string;
    title: string;
    revenue: number;
    participants: number;
  }>;
}

const AdminFinancialDashboard = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialStats();
  }, [period]);

  const fetchFinancialStats = async () => {
    try {
      setLoading(true);

      // Get payment statistics
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'succeeded');

      if (paymentsError) throw paymentsError;

      // Get reservation statistics with trip data
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          trips (id, title, destination)
        `)
        .eq('payment_status', 'paid');

      if (reservationsError) throw reservationsError;

      // Get voucher statistics
      const { data: vouchers, error: vouchersError } = await supabase
        .from('vouchers')
        .select('*');

      if (vouchersError) throw vouchersError;

      // Calculate statistics
      const tripPayments = payments.filter(p => p.type === 'trip_reservation');
      const voucherPayments = payments.filter(p => p.type === 'voucher_purchase');

      const tripRevenue = tripPayments.reduce((sum, p) => sum + p.amount, 0);
      const voucherRevenue = voucherPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalRevenue = tripRevenue + voucherRevenue;

      // Calculate monthly data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format
        
        const monthTripPayments = tripPayments.filter(p => 
          p.created_at.substring(0, 7) === monthStr
        );
        const monthVoucherPayments = voucherPayments.filter(p => 
          p.created_at.substring(0, 7) === monthStr
        );
        
        const monthTripRevenue = monthTripPayments.reduce((sum, p) => sum + p.amount, 0);
        const monthVoucherRevenue = monthVoucherPayments.reduce((sum, p) => sum + p.amount, 0);
        
        monthlyData.push({
          month: date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }),
          tripRevenue: monthTripRevenue,
          voucherRevenue: monthVoucherRevenue,
          totalRevenue: monthTripRevenue + monthVoucherRevenue
        });
      }

      // Calculate top trips
      const tripStats = new Map();
      reservations.forEach(reservation => {
        if (reservation.trips) {
          const tripId = reservation.trips.id;
          const tripTitle = reservation.trips.title;
          
          if (!tripStats.has(tripId)) {
            tripStats.set(tripId, {
              id: tripId,
              title: tripTitle,
              revenue: 0,
              participants: 0
            });
          }
          
          const tripStat = tripStats.get(tripId);
          tripStat.revenue += reservation.total_price;
          tripStat.participants += reservation.number_of_people;
        }
      });

      const topTrips = Array.from(tripStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalRevenue,
        tripRevenue,
        voucherRevenue,
        totalReservations: reservations.length,
        paidReservations: reservations.filter(r => r.payment_status === 'paid').length,
        totalVouchers: vouchers.length,
        monthlyData,
        topTrips
      });

    } catch (error) {
      console.error('Error fetching financial stats:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych finansowych.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!stats) return;

    const reportData = {
      period: `Ostatnie 6 miesięcy (${new Date().toLocaleDateString('pl-PL')})`,
      tripRevenue: stats.tripRevenue,
      voucherRevenue: stats.voucherRevenue,
      totalRevenue: stats.totalRevenue,
      topTrips: stats.topTrips,
      monthlyData: stats.monthlyData
    };

    generateFinancialReportPDF(reportData);
    
    toast({
      title: "Raport wygenerowany",
      description: "Raport finansowy został pobrany.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie udało się załadować danych finansowych.</p>
        <Button onClick={fetchFinancialStats} className="mt-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Finansowy</h1>
          <p className="text-muted-foreground">Przegląd przychodów i statystyk sprzedaży</p>
        </div>
        <Button onClick={generateReport} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Pobierz raport PDF</span>
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączne przychody</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Wycieczki + Vouchery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przychody z wycieczek</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.tripRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.paidReservations} opłaconych rezerwacji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przychody z voucherów</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.voucherRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVouchers} sprzedanych voucherów
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Współczynnik konwersji</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReservations > 0 
                ? Math.round((stats.paidReservations / stats.totalReservations) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Opłacone z {stats.totalReservations} rezerwacji
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Przychody w ostatnich 6 miesiącach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-muted-foreground">
                    Wycieczki: {formatCurrency(month.tripRevenue)} | 
                    Vouchery: {formatCurrency(month.voucherRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(month.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Najpopularniejsze wycieczki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topTrips.map((trip, index) => (
              <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{trip.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.participants} uczestników
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(trip.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancialDashboard;