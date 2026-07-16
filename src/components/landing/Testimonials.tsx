import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Organizacja na najwyższym poziomie. Wszystko było dopięte na ostatni guzik, a koordynator zadbał o każdy szczegół.",
    author: "Anna K.",
    role: "HR Manager",
  },
  {
    quote:
      "Nasz zespół wrócił pełen energii i nowych pomysłów. Zdecydowanie polecamy Złotego Żółwika!",
    author: "Marek W.",
    role: "właściciel firmy",
  },
  {
    quote:
      "Wycieczka szkolna bez żadnych niespodzianek. Rodzice byli spokojni, dzieci zachwycone.",
    author: "Katarzyna M.",
    role: "nauczycielka",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="opinie"
      className="py-24 bg-muted/30"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="testimonials-heading" className="text-4xl font-bold mb-6">
            Co mówią nasi klienci
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative min-h-[320px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className={`absolute inset-0 transition-all ease-in-out ${
                  index === activeIndex
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
                style={{ transitionDuration: "4000ms" }}
                aria-hidden={index !== activeIndex}
              >
                <Card className="border-none shadow-sm bg-card rounded-2xl">
                  <CardContent className="pt-10 pb-8 px-8 text-center">
                    <Quote className="h-8 w-8 text-primary mx-auto mb-6 opacity-60" />
                    <blockquote className="text-lg md:text-xl leading-relaxed mb-8 text-foreground">
                      „{testimonial.quote}"
                    </blockquote>
                    <footer>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </footer>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.author}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-primary" : "w-2.5 bg-primary/30"
                }`}
                aria-label={`Pokaż opinię ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://facebook.com/zlotyzolwikpl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base md:text-lg font-semibold hover:underline"
              style={{ color: "#1877F2" }}
            >
              Odwiedź nas na Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
