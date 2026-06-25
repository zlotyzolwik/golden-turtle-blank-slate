import { Link } from "react-router-dom";

const PublicFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/lovable-uploads/a27c4817-15d6-48be-941e-7b8c03441f76.png"
                alt="Złoty Żółwik logo"
                width="32"
                height="32"
                className="h-8 w-8 object-contain block shrink-0"
                loading="lazy"
                decoding="async"
              />
              <h3 className="text-xl font-bold">Złoty Żółwik – Organizator wyjazdów</h3>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="mailto:kontakt@zloty-zolwik.pl" className="hover:opacity-100">
                  kontakt@zloty-zolwik.pl
                </a>
              </li>
              <li>
                <a href="tel:514176996" className="hover:opacity-100">
                  514 176 996
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Informacje</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/polityka-prywatnosci" className="hover:opacity-100">
                Polityka prywatności
              </Link>
              <Link to="/regulamin" className="hover:opacity-100">
                Regulamin
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} Złoty Żółwik. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
