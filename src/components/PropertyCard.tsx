import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
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
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
          <Badge className="absolute top-4 right-4 bg-secondary">
            {propertyType === 'rent' ? 'For Rent' : 'For Sale'}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {bedrooms}
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {bathrooms}
            </div>
            {areaSqft && (
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                {areaSqft.toLocaleString()} sqft
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <div className="text-2xl font-bold text-primary">
            PKR {price.toLocaleString()}
            {propertyType === 'rent' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}