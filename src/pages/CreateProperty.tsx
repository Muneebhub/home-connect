import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const propertySchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000),
  location: z.string().trim().min(3, 'Location is required').max(200),
  price: z.number().positive('Price must be greater than 0'),
  bedrooms: z.number().int().nonnegative('Bedrooms must be 0 or greater'),
  bathrooms: z.number().int().nonnegative('Bathrooms must be 0 or greater'),
});

export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'rent' as 'rent' | 'sale',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    available_from: '',
    available_to: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input
      propertySchema.parse({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: error.errors[0].message,
        });
      }
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('properties').insert({
        seller_id: user?.id,
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        price: parseFloat(formData.price),
        location: formData.location,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : null,
        available_from: formData.available_from || null,
        available_to: formData.available_to || null,
      }).select();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your property has been listed.',
      });
      
      navigate('/seller-dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create property listing.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/seller-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Property Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Modern 2BR Apartment in Downtown"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_type">Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(v) => handleChange('property_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price * {formData.property_type === 'rent' && '(per month)'}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., 123 Main St, San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_sqft">Area (sqft)</Label>
                  <Input
                    id="area_sqft"
                    type="number"
                    placeholder="0"
                    value={formData.area_sqft}
                    onChange={(e) => handleChange('area_sqft', e.target.value)}
                  />
                </div>
              </div>

              {formData.property_type === 'rent' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="available_from">Available From</Label>
                    <Input
                      id="available_from"
                      type="date"
                      value={formData.available_from}
                      onChange={(e) => handleChange('available_from', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available_to">Available To</Label>
                    <Input
                      id="available_to"
                      type="date"
                      value={formData.available_to}
                      onChange={(e) => handleChange('available_to', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Property'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/seller-dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}