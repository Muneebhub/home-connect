import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';

const placeholderImages = [property1, property2, property3];

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<'all' | 'rent' | 'sale'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, [propertyType]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*, property_images(image_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (propertyType !== 'all') {
        query = query.eq('property_type', propertyType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load properties. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Properties</h1>
          <p className="text-muted-foreground text-lg">
            Find your perfect property from our curated collection
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by location or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={propertyType} onValueChange={(v: any) => setPropertyType(v)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                location={property.location}
                price={property.price}
                propertyType={property.property_type}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                areaSqft={property.area_sqft}
                imageUrl={
                  property.property_images?.[0]?.image_url ||
                  placeholderImages[index % placeholderImages.length]
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}