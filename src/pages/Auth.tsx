import { useState, useEffect } from "react";
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
  const [signUpConfirmationSent, setSignUpConfirmationSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const fromEmailLink =
      hashParams.get("type") === "signup" ||
      searchParams.get("type") === "signup" ||
      Boolean(hashParams.get("access_token")) ||
      Boolean(searchParams.get("code"));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && fromEmailLink) {
        toast({
          title: "E-mail potwierdzony",
          description: "Konto zostało aktywowane. Możesz korzystać z serwisu.",
        });
        navigate("/");
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !fromEmailLink) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpConfirmationSent(false);
    setSignUpLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("already registered") || message.includes("already been registered")) {
          setSignUpError("Konto z tym adresem e-mail już istnieje. Przejdź do logowania.");
        } else if (message.includes("rate limit") || message.includes("email rate")) {
          setSignUpError("Limit wysyłki e-maili wyczerpany. Spróbuj ponownie za około godzinę.");
        } else {
          setSignUpError(error.message);
        }
        return;
      }

      // Supabase may return a user with empty identities when the email is already taken
      const identities = data.user?.identities ?? [];
      if (data.user && identities.length === 0) {
        setSignUpError("Konto z tym adresem e-mail już istnieje. Przejdź do logowania lub odzyskaj hasło.");
        return;
      }

      setPassword("");

      if (!data.session) {
        // Confirm email is enabled — account is pending until link is clicked
        setSignUpConfirmationSent(true);
        toast({
          title: "Potwierdź adres e-mail",
          description: "Wysłaliśmy link aktywacyjny. Po kliknięciu możesz się zalogować.",
        });
        return;
      }

      // Confirm email disabled — user is signed in immediately
      toast({
        title: "Konto utworzone",
        description: "Zostałeś zalogowany.",
      });
      navigate("/");
    } catch {
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
        const message = error.message.toLowerCase();
        if (message.includes("email not confirmed")) {
          setSignInError(
            "Adres e-mail nie został potwierdzony. Sprawdź skrzynkę i kliknij link aktywacyjny."
          );
        } else if (message.includes("invalid login credentials")) {
          setSignInError(
            "Nieprawidłowy e-mail lub hasło. Sprawdź dane albo przejdź do rejestracji."
          );
        } else {
          setSignInError(error.message);
        }
        return;
      }

      toast({
        title: "Pomyślnie zalogowano",
        description: "Witamy z powrotem!",
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session?.user.id ?? "")
        .single();

      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
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

                {signUpConfirmationSent && (
                  <Alert>
                    <AlertDescription>
                      Na adres <strong>{email}</strong> wysłaliśmy link aktywacyjny.
                      Potwierdź e-mail, a potem zaloguj się. Sprawdź też folder spam.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Adres e-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSignUpConfirmationSent(false);
                    }}
                    required
                    disabled={signUpConfirmationSent}
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
                    disabled={signUpConfirmationSent}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signUpLoading || signUpConfirmationSent}
                >
                  {signUpLoading
                    ? "Rejestrowanie..."
                    : signUpConfirmationSent
                      ? "Link wysłany"
                      : "Utwórz konto"}
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