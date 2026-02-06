import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "@/hooks/useMovies";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div 
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] animate-fade-in cursor-pointer"
      onClick={handleClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card shadow-card">
        <img
          src={movie.poster_url || "/placeholder.svg"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {/* Rating Badge */}
        {movie.rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-background/90 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-semibold text-foreground">{movie.rating}</span>
          </div>
        )}

        {/* Book Button on Hover */}
        {movie.is_available && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              Book
            </button>
          </div>
        )}

        {/* Coming Soon Badge */}
        {!movie.is_available && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded">
            Coming Soon
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {movie.genre.join(" • ")}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {movie.language}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
