import { Search, MapPin, Menu, X, User, Ticket, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground hidden sm:block">
              BookMyShow
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Location & Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Mumbai</span>
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2">
                    <Avatar className="w-9 h-9 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2" disabled>
                    <User className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/bookings")}
                  >
                    <Ticket className="w-4 h-4" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => navigate("/auth")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMenuOpen && (
          <div className="md:hidden px-4 pb-4 animate-fade-in">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies, events..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Mumbai</span>
            </div>
            {user && (
              <div className="mt-3 pt-3 border-t border-border">
                <button 
                  onClick={() => {
                    navigate("/bookings");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Ticket className="w-4 h-4" />
                  My Bookings
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 px-4 py-3 border-t border-border/50">
          <Link to="/" className="text-sm font-medium text-primary">Movies</Link>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Stream</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Events</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Plays</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sports</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Activities</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
