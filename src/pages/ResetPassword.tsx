import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

function getAuthParamsFromUrl() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return {
    code: search.get("code") ?? hash.get("code"),
    accessToken: hash.get("access_token") ?? search.get("access_token"),
    refreshToken: hash.get("refresh_token") ?? search.get("refresh_token"),
    type: hash.get("type") ?? search.get("type"),
    error:
      search.get("error_description") ??
      search.get("error") ??
      hash.get("error_description") ??
      hash.get("error"),
  };
}

function clearAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.history.replaceState(null, "", url.pathname);
}

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [readyToReset, setReadyToReset] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    const markReady = () => {
      if (cancelled || settled) return;
      settled = true;
      setReadyToReset(true);
      setCheckingSession(false);
      clearAuthParamsFromUrl();
    };

    const fail = (message: string) => {
      if (cancelled || settled) return;
      settled = true;
      setLinkError(message);
      setCheckingSession(false);
      setReadyToReset(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        markReady();
        return;
      }

      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") &&
        session
      ) {
        markReady();
      }
    });

    const establishSession = async () => {
      const params = getAuthParamsFromUrl();

      if (params.error) {
        fail(
          decodeURIComponent(params.error.replace(/\+/g, " ")) ||
            "Link resetujący jest nieprawidłowy lub wygasł."
        );
        return;
      }

      // detectSessionInUrl may already have finished
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (cancelled || settled) return;
      if (existing) {
        markReady();
        return;
      }

      // PKCE leftover: exchange one-time code
      if (params.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (cancelled || settled) return;

        if (!exchangeError) {
          markReady();
          return;
        }

        const { data: { session: afterExchange } } = await supabase.auth.getSession();
        if (cancelled || settled) return;
        if (afterExchange) {
          markReady();
          return;
        }

        fail(
          "Nie udało się zweryfikować linku. Otwórz go w tej samej przeglądarce, w której prosiłeś o reset, albo wyślij nowy link."
        );
        return;
      }

      // Implicit: tokens in hash (works across browsers / email apps)
      if (params.accessToken && params.refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.accessToken,
          refresh_token: params.refreshToken,
        });
        if (cancelled || settled) return;

        if (!sessionError) {
          markReady();
          return;
        }

        fail("Nie udało się otworzyć sesji resetu. Wyślij nowy link resetujący.");
        return;
      }

      // Client may still be parsing the URL
      await new Promise((r) => window.setTimeout(r, 2000));
      if (cancelled || settled) return;

      const { data: { session: delayedSession } } = await supabase.auth.getSession();
      if (cancelled || settled) return;

      if (delayedSession) {
        markReady();
      } else {
        fail(
          "Link resetujący jest nieprawidłowy, wygasł lub został już użyty. Poproś o nowy link na stronie logowania."
        );
      }
    };

    void establishSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError("Błąd podczas zmiany hasła: " + updateError.message);
      } else {
        toast({
          title: "Hasło zostało zmienione",
          description: "Możesz teraz zalogować się nowym hasłem.",
        });
        await supabase.auth.signOut();
        navigate("/auth", { replace: true });
      }
    } catch {
      setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Weryfikacja linku resetującego…</p>
        </div>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Link nie działa</CardTitle>
            <CardDescription>Nie udało się przejść do zmiany hasła</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{linkError}</AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link to="/auth">Wróć do logowania</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!readyToReset) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Resetuj hasło</CardTitle>
          <CardDescription>Wprowadź nowe hasło dla swojego konta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź nowe hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Potwierdź nowe hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Zmienianie hasła..." : "Zmień hasło"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
