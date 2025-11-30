import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function BuyerDashboard() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (userRole === 'seller') {
      navigate('/seller-dashboard');
      return;
    }
  }, [user, userRole]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Find your dream property</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Browse Properties</h3>
              <p className="text-muted-foreground mb-4">
                Explore our curated collection of properties for rent and sale.
              </p>
              <Link to="/properties">
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  View All Properties
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Saved Properties</h3>
              <p className="text-muted-foreground mb-4">
                View and manage your saved property listings.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <p className="text-muted-foreground text-center py-8">
              No recent activity yet. Start browsing properties!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}