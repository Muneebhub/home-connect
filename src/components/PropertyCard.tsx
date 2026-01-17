import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  areaSqft: number | null;
  imageUrl: string;
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  propertyType,
  bedrooms,
  bathrooms,
  areaSqft,
  imageUrl,
}: PropertyCardProps) {
  return (
    <Link to={`/property/${id}`}>
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-card">
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <Badge className={`absolute top-4 left-4 ${propertyType === 'rent' ? 'bg-secondary' : 'bg-primary'} text-white font-semibold shadow-lg`}>
            {propertyType === 'rent' ? 'For Rent' : 'For Sale'}
          </Badge>
          
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 shadow-lg">
            <ArrowUpRight className="h-5 w-5 text-primary" />
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium shadow-lg">
              <Bed className="h-4 w-4 text-primary" />
              {bedrooms}
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium shadow-lg">
              <Bath className="h-4 w-4 text-secondary" />
              {bathrooms}
            </div>
            {areaSqft && (
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium shadow-lg">
                <Square className="h-4 w-4 text-accent" />
                {areaSqft.toLocaleString()}
              </div>
            )}
          </div>
        </div>
        
        <CardContent className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1.5 text-primary/70" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </CardContent>
        
        <CardFooter className="px-5 pb-5 pt-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PKR {price.toLocaleString()}
            </span>
            {propertyType === 'rent' && (
              <span className="text-sm font-medium text-muted-foreground">/month</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
