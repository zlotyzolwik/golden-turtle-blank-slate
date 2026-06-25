import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Brand from "@/components/Brand";
import { SITE_FEATURES } from "@/config/siteFeatures";

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const PublicNav = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <nav
        className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b"
        role="navigation"
        aria-label="Główna nawigacja"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <Brand />
          <div className="flex items-center flex-wrap justify-end gap-2 md:gap-4">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => scrollToSection("wycieczki-szyte-na-miare")}
            >
              Jak działamy
            </Button>
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => scrollToSection("kierunki")}
            >
              Kierunki
            </Button>
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => scrollToSection("contact-section")}
            >
              Kontakt
            </Button>
            {SITE_FEATURES.showVouchersInNav && (
              <Button
                variant="ghost"
                onClick={() => navigate("/vouchers")}
                aria-label="Zobacz vouchery"
              >
                Vouchery
              </Button>
            )}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/my-reservations">
                  <Button variant="ghost" aria-label="Zobacz moje rezerwacje">
                    Moje Rezerwacje
                  </Button>
                </Link>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin")}
                    aria-label="Przejdź do panelu administracyjnego"
                  >
                    Panel Admin
                  </Button>
                )}
                <Button variant="outline" onClick={() => signOut()} aria-label="Wyloguj się">
                  Wyloguj
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate("/auth")} aria-label="Zaloguj się">
                Zaloguj się
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default PublicNav;
