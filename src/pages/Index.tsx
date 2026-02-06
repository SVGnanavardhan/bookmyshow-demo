import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import MovieCarousel from "@/components/MovieCarousel";
import Footer from "@/components/Footer";
import { featuredMovie, nowShowingMovies, comingSoonMovies, trendingMovies } from "@/data/movies";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-[120px] md:pt-[100px]">
        {/* Hero Banner */}
        <HeroBanner movie={featuredMovie} />

        {/* Movie Sections */}
        <div className="space-y-4">
          <MovieCarousel
            title="Now Showing"
            subtitle="Book tickets for movies currently in theaters"
            movies={nowShowingMovies}
          />

          <MovieCarousel
            title="Coming Soon"
            subtitle="Upcoming releases you don't want to miss"
            movies={comingSoonMovies}
          />

          <MovieCarousel
            title="Trending This Week"
            subtitle="Most popular movies right now"
            movies={trendingMovies}
          />
        </div>

        {/* Promotional Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-card to-primary/20 border border-border p-8 md:p-12">
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
                Get Exclusive Offers
              </h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter and get amazing discounts on your favorite movies and events!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 max-w-sm"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-glow">
                  Subscribe
                </button>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
