import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Gallery = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Toskania - Florencja"
    },
    {
      url: "https://images.unsplash.com/photo-1555990538-c8f1760d8dbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Chorwacja - Dubrownik"
    },
    {
      url: "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Czechy - Praga"
    },
    {
      url: "https://images.unsplash.com/photo-1539650116574-75c0c6d89bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Grecja - Santorini"
    },
    {
      url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Hiszpania - Barcelona"
    },
    {
      url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Anglia - Londyn"
    }
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Galeria Wspomnień</h2>
          <p className="text-xl text-muted-foreground">
            Zobacz zdjęcia z naszych poprzednich wyjazdów i poczuj magię podróży
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {galleryImages.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div 
                  className="relative overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => setCurrentImage(index)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold">{image.title}</h3>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full p-0">
                <div className="relative">
                  <img
                    src={galleryImages[currentImage].url}
                    alt={galleryImages[currentImage].title}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 px-4 py-2 rounded-lg">
                    <h3 className="font-semibold">{galleryImages[currentImage].title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentImage + 1} z {galleryImages.length}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;