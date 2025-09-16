import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ContactMessage } from "@/types/trips";
import { Search, Mail, MailOpen, CheckCircle, TestTube, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać wiadomości.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      // If marking as replied, add replied_at timestamp
      if (status === 'replied') {
        updateData.replied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(m => 
        m.id === messageId 
          ? { ...m, status, ...(status === 'replied' && { replied_at: new Date().toISOString() }) }
          : m
      ));

      toast({
        title: "Sukces",
        description: "Status wiadomości został zaktualizowany.",
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu.",
        variant: "destructive",
      });
    }
  };

  const testSmtpConnection = async () => {
    setTestingSmtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('smtp-test');
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Test SMTP zakończony sukcesem! ✅",
          description: `Połączenie z serwerem SMTP działa prawidłowo. Email testowy został wysłany.`,
        });
      } else {
        toast({
          title: "Test SMTP nieudany ❌",
          description: data.error || "Wystąpił błąd podczas testowania SMTP.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('SMTP test error:', error);
      toast({
        title: "Błąd testu SMTP ❌",
        description: `Nie udało się wykonać testu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "Nowa", className: "bg-blue-500", icon: Mail },
      in_progress: { label: "W trakcie", className: "bg-yellow-500", icon: MailOpen },
      replied: { label: "Odpowiedziana", className: "bg-green-500", icon: CheckCircle },
      closed: { label: "Zamknięta", className: "bg-gray-500", icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      className: "bg-gray-500",
      icon: Mail
    };
    
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getMessagesByStatus = (status: string) => {
    return filteredMessages.filter(m => m.status === status).length;
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
        <h2 className="text-2xl font-bold tracking-tight">Wiadomości</h2>
        <p className="text-muted-foreground">Zarządzaj wiadomościami od klientów.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {getMessagesByStatus('new')}
            </div>
            <p className="text-sm text-muted-foreground">Nowe</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {getMessagesByStatus('in_progress')}
            </div>
            <p className="text-sm text-muted-foreground">W trakcie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {getMessagesByStatus('replied')}
            </div>
            <p className="text-sm text-muted-foreground">Odpowiedziane</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {getMessagesByStatus('closed')}
            </div>
            <p className="text-sm text-muted-foreground">Zamknięte</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj wiadomości..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button
          onClick={testSmtpConnection}
          disabled={testingSmtp}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {testingSmtp ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4" />
          )}
          <span>{testingSmtp ? "Testowanie..." : "Test SMTP"}</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className={message.status === 'new' ? 'border-primary/50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{message.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{message.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(message.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {message.subject && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-900">Temat: {message.subject}</p>
                    </div>
                  )}
                  {message.phone && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">📞 Telefon: {message.phone}</p>
                    </div>
                  )}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>

                {message.replied_at && (
                  <p className="text-xs text-muted-foreground">
                    Odpowiedziano: {new Date(message.replied_at).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Select
                    value={message.status}
                    onValueChange={(status) => updateMessageStatus(message.id, status)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nowa</SelectItem>
                      <SelectItem value="in_progress">W trakcie</SelectItem>
                      <SelectItem value="replied">Odpowiedziana</SelectItem>
                      <SelectItem value="closed">Zamknięta</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${message.email}`, '_blank')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Odpowiedz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Nie znaleziono wiadomości pasujących do wyszukiwania." : "Brak wiadomości."}
          </p>
        </div>
      )}
    </div>
  );
}