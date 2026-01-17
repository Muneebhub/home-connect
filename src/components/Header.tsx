import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Home className="h-6 w-6 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              TUMHARAGHAR
            </span>
            <span className="text-xs text-muted-foreground font-medium tracking-wider">
              YOUR DREAM HOME AWAITS
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/properties">
            <Button variant="ghost" className="text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300">
              Browse Properties
            </Button>
          </Link>
          
          {user ? (
            <>
              <Link to={userRole === 'seller' ? '/seller-dashboard' : '/buyer-dashboard'}>
                <Button variant="ghost" className="gap-2 text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="gap-2 border-2 hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
