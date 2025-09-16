import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";
import { Trip } from "@/types/trips";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface TripCardProps {
  trip: Trip;
  onViewDetails: (trip: Trip) => void;
}

const TripCard = ({ trip, onViewDetails }: TripCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={trip.featured_image}
          alt={trip.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge 
            variant={trip.available_spots <= 10 ? "destructive" : "secondary"} 
            className={`${trip.available_spots <= 10 
              ? "bg-orange-500 text-white font-bold animate-pulse" 
              : "bg-background/90 text-foreground"
            }`}
          >
            {trip.available_spots <= 10 
              ? `OSTATNIE ${trip.available_spots} MIEJSC` 
              : `${trip.available_spots} miejsc`
            }
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl">{trip.title}</CardTitle>
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {trip.destination}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {trip.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {format(new Date(trip.departure_date), "dd MMM", { locale: pl })} - {" "}
              {format(new Date(trip.return_date), "dd MMM yyyy", { locale: pl })}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{trip.available_spots} z {trip.total_spots} wolnych miejsc</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-6">
        <div className="text-2xl font-bold text-primary">
          {trip.price.toLocaleString('pl-PL')} {trip.currency}
        </div>
        <Button onClick={() => onViewDetails(trip)}>
          Zobacz szczegóły
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TripCard;