import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Calendar, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import property1 from '@/assets/property-1.jpg';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*, property_images(image_url)')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', propertyData.seller_id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load property details.',
      });
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const mainImage = property.property_images?.[0]?.image_url || property1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/properties')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative h-96 rounded-lg overflow-hidden mb-6">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-secondary">
                {property.property_type === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              {property.location}
            </div>

            <div className="flex items-center gap-6 mb-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              {property.area_sqft && (
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5" />
                  <span>{property.area_sqft.toLocaleString()} sqft</span>
                </div>
              )}
            </div>

            <div className="border-t pt-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {(property.available_from || property.available_to) && (
              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold mb-4">Availability</h2>
                <div className="flex gap-4 text-muted-foreground">
                  {property.available_from && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>From: {new Date(property.available_from).toLocaleDateString()}</span>
                    </div>
                  )}
                  {property.available_to && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>To: {new Date(property.available_to).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card p-6 rounded-lg border shadow-sm">
              <div className="text-3xl font-bold text-primary mb-6">
                PKR {property.price.toLocaleString()}
                {property.property_type === 'rent' && (
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                )}
              </div>

              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold mb-4">Contact Seller</h3>
                {seller && (
                  <div className="space-y-3">
                    <p className="font-medium">{seller.full_name}</p>
                    {seller.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{seller.email}</span>
                      </div>
                    )}
                    {seller.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button className="w-full" size="lg">
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}