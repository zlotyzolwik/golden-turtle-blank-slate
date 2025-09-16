import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RepairResult {
  paymentId: string;
  reservationId: string;
  customerName?: string;
  customerEmail?: string;
  status: 'repaired' | 'already_paid' | 'error';
  message: string;
}

interface RepairResponse {
  success: boolean;
  repairedCount: number;
  totalChecked: number;
  results: RepairResult[];
  error?: string;
}

interface PaymentRepairToolProps {
  onComplete?: () => void;
}

export const PaymentRepairTool = ({ onComplete }: PaymentRepairToolProps) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResults, setRepairResults] = useState<RepairResponse | null>(null);
  const { toast } = useToast();

  const handleRepairPayments = async () => {
    setIsRepairing(true);
    setRepairResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('repair-payments');
      
      if (error) {
        throw new Error(error.message);
      }

      setRepairResults(data);
      
      if (data.success) {
        toast({
          title: "Naprawiono płatności",
          description: `Naprawiono ${data.repairedCount} z ${data.totalChecked} płatności`,
        });
        onComplete?.(); // Refresh the reservations list
      } else {
        toast({
          title: "Błąd naprawy",
          description: data.error || "Wystąpił błąd podczas naprawy płatności",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error repairing payments:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się uruchomić naprawy płatności",
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'repaired':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'already_paid':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'repaired':
        return <Badge variant="default" className="bg-green-600">Naprawiono</Badge>;
      case 'already_paid':
        return <Badge variant="secondary">Już opłacone</Badge>;
      case 'error':
        return <Badge variant="destructive">Błąd</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Naprawa statusów płatności
        </CardTitle>
        <CardDescription>
          Synchronizuje statusy rezerwacji z opłaconymi płatnościami w Stripe.
          Użyj tego narzędzia aby naprawić rezerwacje które mają status "pending" mimo opłaconych płatności.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleRepairPayments}
          disabled={isRepairing}
          className="w-full"
        >
          {isRepairing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Naprawiam płatności...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Napraw statusy płatności
            </>
          )}
        </Button>

        {repairResults && (
          <div className="space-y-4">
            <div className="p-4 bg-background rounded-lg border">
              <h3 className="font-semibold mb-2">Wyniki naprawy:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sprawdzono:</span>
                  <div className="font-semibold">{repairResults.totalChecked}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Naprawiono:</span>
                  <div className="font-semibold text-green-600">{repairResults.repairedCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Błędów:</span>
                  <div className="font-semibold text-red-600">
                    {repairResults.results.filter(r => r.status === 'error').length}
                  </div>
                </div>
              </div>
            </div>

            {repairResults.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Szczegóły:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {repairResults.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">{result.customerName || 'Brak nazwy'}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.customerEmail}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};