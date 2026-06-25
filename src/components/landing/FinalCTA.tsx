import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ContactForm";

const FinalCTA = () => {
  return (
    <section
      id="contact-section"
      className="py-24 bg-muted/30"
      aria-labelledby="final-cta-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 id="final-cta-heading" className="text-4xl font-bold mb-6">
            Gotowy na wyjazd?
          </h2>
          <p className="text-xl text-muted-foreground">
            Napisz do nas, powiedz czego potrzebujesz, a my zajmiemy się resztą.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="mt-6"
          >
            <a href="tel:514176996" className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Zadzwoń: 514 176 996
            </a>
          </Button>
        </div>

        <ContactForm hideHeader embedded />
      </div>
    </section>
  );
};

export default FinalCTA;
