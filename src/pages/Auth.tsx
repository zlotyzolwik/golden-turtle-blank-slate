import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Brand from "@/components/Brand";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setSignUpError("Konto z tym adresem e-mail już istnieje. Przejdź do logowania.");
        } else {
          setSignUpError(error.message);
        }
      } else {
        toast({
          title: "Zostałeś pomyślnie zarejestrowany!",
          description: "Możesz teraz się zalogować używając swoich danych.",
        });
        
        // Clear form and switch to login tab
        setEmail("");
        setPassword("");
        setActiveTab("signin");
      }
    } catch (error) {
      setSignUpError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setSignInError("Użytkownik o podanych danych nie jest zarejestrowany. Sprawdź dane lub przejdź do rejestracji.");
        } else {
          setSignInError(error.message);
        }
      } else {
        toast({
          title: "Pomyślnie zalogowano",
          description: "Witamy z powrotem!",
        });
        
        // Check if user is admin and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', (await supabase.auth.getSession()).data.session?.user.id)
          .single();
          
        if (profile?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      setSignInError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordLoading(true);

    if (!email) {
      setForgotPasswordError("Wprowadź adres e-mail");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setForgotPasswordError(error.message);
      } else {
        setResetEmailSent(true);
        toast({
          title: "Link resetujący został wysłany",
          description: "Sprawdź skrzynkę e-mail i otwórz link (najlepiej w tej samej przeglądarce).",
        });

      }
    } catch (error) {
      setForgotPasswordError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Brand />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Witamy</CardTitle>
          <CardDescription>
            Zaloguj się, utwórz nowe konto lub odzyskaj hasło
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Logowanie</TabsTrigger>
              <TabsTrigger value="signup">Rejestracja</TabsTrigger>
              <TabsTrigger value="forgot">Odzyskaj hasło</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <Alert variant="destructive">
                    <AlertDescription>{signInError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Adres e-mail</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Hasło</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Wprowadź hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signInLoading}
                >
                  {signInLoading ? "Logowanie..." : "Zaloguj się"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Nie masz konta? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-primary hover:underline"
                  >
                    Zarejestruj się
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {signUpError && (
                  <Alert variant="destructive">
                    <AlertDescription>{signUpError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Adres e-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Hasło</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Utwórz hasło (min. 6 znaków)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signUpLoading}
                >
                  {signUpLoading ? "Rejestrowanie..." : "Utwórz konto"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Masz już konto? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="text-primary hover:underline"
                  >
                    Zaloguj się
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotPasswordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{forgotPasswordError}</AlertDescription>
                  </Alert>
                )}
                
                {resetEmailSent && (
                  <Alert>
                    <AlertDescription>
                      Link resetujący hasło został wysłany na Twój adres e-mail. Sprawdź skrzynkę odbiorczą.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Adres e-mail</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Pamiętasz hasło? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="text-primary hover:underline"
                  >
                    Zaloguj się
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          ← Powrót na stronę główną
        </Link>
      </div>
    </div>
  );
};

export default Auth;