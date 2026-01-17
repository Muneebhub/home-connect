import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Calendar, ArrowLeft, Mail, Phone, MessageCircle, Star, Shield, CheckCircle } from 'lucide-react';
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

  const handleWhatsAppClick = () => {
    if (seller?.phone) {
      // Clean the phone number and format for WhatsApp
      const cleanPhone = seller.phone.replace(/[^0-9+]/g, '');
      const message = encodeURIComponent(`Hi! I'm interested in your property: "${property.title}" listed on TUMHARAGHAR for PKR ${property.price.toLocaleString()}. Please provide more details.`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: 'Phone number not available',
        description: 'The seller has not provided a WhatsApp number.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading property details...</p>
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
          className="mb-6 hover:bg-primary/10 hover:text-primary transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image */}
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <Badge className={`absolute top-6 left-6 ${property.property_type === 'rent' ? 'bg-secondary' : 'bg-primary'} text-white font-semibold text-base px-4 py-2 shadow-lg`}>
                {property.property_type === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <Bed className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{property.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <Bath className="h-5 w-5 text-secondary" />
                    <span className="font-semibold">{property.bathrooms} Baths</span>
                  </div>
                  {property.area_sqft && (
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <Square className="h-5 w-5 text-accent" />
                      <span className="font-semibold">{property.area_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{property.title}</h1>
              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span className="text-lg">{property.location}</span>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="h-6 w-6 text-accent" />
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                  {property.description}
                </p>
              </div>

              {(property.available_from || property.available_to) && (
                <div className="border-t border-border pt-8 mt-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-secondary" />
                    Availability
                  </h2>
                  <div className="flex gap-6 text-muted-foreground">
                    {property.available_from && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                        <span className="font-medium">From:</span>
                        <span>{new Date(property.available_from).toLocaleDateString()}</span>
                      </div>
                    )}
                    {property.available_to && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                        <span className="font-medium">To:</span>
                        <span>{new Date(property.available_to).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded-3xl text-white shadow-2xl">
                <div className="text-sm font-medium text-white/80 mb-2">Price</div>
                <div className="text-4xl font-bold mb-2">
                  PKR {property.price.toLocaleString()}
                  {property.property_type === 'rent' && (
                    <span className="text-lg font-normal text-white/80">/month</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 text-white/80">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Verified Listing</span>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-lg">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Contact Seller
                </h3>
                
                {seller && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {seller.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{seller.full_name || 'Seller'}</p>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                    
                    {seller.email && (
                      <div className="flex items-center gap-3 text-muted-foreground bg-muted/50 rounded-xl p-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-sm">{seller.email}</span>
                      </div>
                    )}
                    
                    {seller.phone && (
                      <div className="flex items-center gap-3 text-muted-foreground bg-muted/50 rounded-xl p-3">
                        <Phone className="h-5 w-5 text-secondary" />
                        <span className="text-sm">{seller.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat on WhatsApp
                  </Button>
                  
                  {seller?.phone && (
                    <Button 
                      variant="outline"
                      className="w-full border-2 font-semibold py-6 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                      size="lg"
                      onClick={() => window.location.href = `tel:${seller.phone}`}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Call Seller
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
