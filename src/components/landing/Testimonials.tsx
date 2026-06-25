import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="border-none shadow-sm bg-card">
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
