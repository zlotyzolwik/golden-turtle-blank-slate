import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Voucher } from "@/types/trips";
import { Plus, Search, Gift, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    recipient_email: "",
    recipient_name: "",
    sender_name: "",
    message: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać voucherów.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateVoucherCode = () => {
    return 'VOUCHER-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createVoucher = async () => {
    if (!formData.amount) {
      toast({
        title: "Błąd",
        description: "Kwota jest wymagana.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const voucherData = {
        code: generateVoucherCode(),
        amount: parseFloat(formData.amount),
        currency: 'PLN',
        recipient_email: formData.recipient_email || null,
        recipient_name: formData.recipient_name || null,
        sender_name: formData.sender_name || null,
        message: formData.message || null,
        expires_at: formData.expires_at || null,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('vouchers')
        .insert([voucherData])
        .select()
        .single();

      if (error) throw error;

      setVouchers([data, ...vouchers]);
      setIsCreateDialogOpen(false);
      setFormData({
        amount: "",
        recipient_email: "",
        recipient_name: "",
        sender_name: "",
        message: "",
        expires_at: "",
      });

      toast({
        title: "Sukces",
        description: "Voucher został utworzony.",
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć vouchera.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deactivateVoucher = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({ status: 'inactive' })
        .eq('id', voucherId);

      if (error) throw error;

      setVouchers(vouchers.map(v => 
        v.id === voucherId ? { ...v, status: 'inactive' } : v
      ));

      toast({
        title: "Sukces",
        description: "Voucher został dezaktywowany.",
      });
    } catch (error) {
      console.error('Error deactivating voucher:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dezaktywować vouchera.",
        variant: "destructive",
      });
    }
  };

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (voucher.recipient_email && voucher.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (voucher: Voucher) => {
    const isExpired = voucher.expires_at && new Date(voucher.expires_at) < new Date();
    const isUsed = voucher.used_at;
    
    if (isUsed) return <Badge className="bg-gray-500">Użyty</Badge>;
    if (isExpired) return <Badge className="bg-red-500">Wygasł</Badge>;
    if (voucher.status === 'active') return <Badge className="bg-green-500">Aktywny</Badge>;
    return <Badge className="bg-red-500">Nieaktywny</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vouchery</h2>
          <p className="text-muted-foreground">Zarządzaj voucherami rabatowymi.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Utwórz voucher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Utwórz nowy voucher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Kwota (PLN) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="recipient_email">Email odbiorcy</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
                  placeholder="odbiorca@email.com"
                />
              </div>
              <div>
                <Label htmlFor="recipient_name">Imię odbiorcy</Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
                  placeholder="Jan Kowalski"
                />
              </div>
              <div>
                <Label htmlFor="sender_name">Imię nadawcy</Label>
                <Input
                  id="sender_name"
                  value={formData.sender_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
                  placeholder="Anna Nowak"
                />
              </div>
              <div>
                <Label htmlFor="expires_at">Data wygaśnięcia</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="message">Wiadomość</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Życzenia urodzinowe..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={createVoucher} disabled={isCreating}>
                  {isCreating ? "Tworzenie..." : "Utwórz"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj voucherów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVouchers.map((voucher) => (
          <Card key={voucher.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{voucher.code}</CardTitle>
                </div>
                {getStatusBadge(voucher)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {voucher.amount} {voucher.currency}
                </div>
                
                {voucher.recipient_name && (
                  <p className="text-sm text-muted-foreground">
                    Dla: {voucher.recipient_name}
                  </p>
                )}
                
                {voucher.recipient_email && (
                  <p className="text-sm text-muted-foreground">
                    Email: {voucher.recipient_email}
                  </p>
                )}
                
                {voucher.sender_name && (
                  <p className="text-sm text-muted-foreground">
                    Od: {voucher.sender_name}
                  </p>
                )}

                {voucher.expires_at && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Wygasa: {new Date(voucher.expires_at).toLocaleDateString('pl-PL')}</span>
                  </div>
                )}

                {voucher.message && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                    {voucher.message}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Utworzony: {new Date(voucher.created_at).toLocaleDateString('pl-PL')}
                </p>

                {voucher.used_at && (
                  <p className="text-xs text-muted-foreground">
                    Użyty: {new Date(voucher.used_at).toLocaleDateString('pl-PL')}
                  </p>
                )}
              </div>

              {voucher.status === 'active' && !voucher.used_at && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => deactivateVoucher(voucher.id)}
                >
                  Dezaktywuj
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVouchers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Nie znaleziono voucherów pasujących do wyszukiwania." : "Brak voucherów."}
          </p>
        </div>
      )}
    </div>
  );
}