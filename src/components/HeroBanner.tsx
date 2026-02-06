import { Play, Star } from "lucide-react";

interface HeroBannerProps {
  movie: {
    title: string;
    tagline: string;
    rating: number;
    genre: string[];
    image: string;
  };
}

const HeroBanner = ({ movie }: HeroBannerProps) => {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${movie.image})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto h-full flex items-center px-4">
        <div className="max-w-xl animate-slide-in">
          {/* Badge */}
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
            Featured
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
            {movie.title}
          </h1>

          {/* Tagline */}
          <p className="text-lg text-muted-foreground mb-6">
            {movie.tagline}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{movie.rating}/10</span>
            </div>
            <div className="flex gap-2">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-glow">
              <Play className="w-5 h-5 fill-current" />
              Book Tickets
            </button>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors">
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
