import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Movies Section */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Movies</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Now Showing</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Coming Soon</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Top Rated</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Movie Reviews</a></li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Help</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Entertainment Section */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Entertainment</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Events</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Plays</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sports</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Activities</a></li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-display font-semibold text-foreground">BookMyShow</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2024 BookMyShow Clone. All Rights Reserved. Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
