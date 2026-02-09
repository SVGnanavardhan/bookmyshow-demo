import { useState, useRef, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Showtime {
  time: string;
  theater: string;
}

interface DateShowtimeSelectorProps {
  showtimes: Showtime[];
  onSelectShowtime: (theater: string, time: string) => void;
}

const DateShowtimeSelector = ({ showtimes, onSelectShowtime }: DateShowtimeSelectorProps) => {
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group showtimes by theater
  const theaterShowtimes = showtimes.reduce((acc, st) => {
    if (!acc[st.theater]) acc[st.theater] = [];
    acc[st.theater].push(st.time);
    return acc;
  }, {} as Record<string, string[]>);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Select Date</h3>
        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1 -mx-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dates.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all min-w-[72px]",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 text-foreground"
                  )}
                >
                  <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                    {isToday ? "Today" : format(date, "EEE")}
                  </span>
                  <span className="text-xl font-bold mt-0.5">
                    {format(date, "dd")}
                  </span>
                  <span className="text-xs opacity-70">
                    {format(date, "MMM")}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Theaters & Showtimes for selected date */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Theaters & Showtimes
          <Badge variant="outline" className="ml-auto text-xs">
            {format(selectedDate, "EEE, dd MMM")}
          </Badge>
        </h3>

        {Object.keys(theaterShowtimes).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(theaterShowtimes).map(([theater, times]) => (
              <div
                key={theater}
                className="bg-card rounded-xl border border-border p-4 transition-all hover:border-primary/30"
              >
                <h4 className="font-semibold text-foreground mb-3">{theater}</h4>
                <div className="flex flex-wrap gap-2">
                  {times.map((time, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectShowtime(theater, time)}
                      className="gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No showtimes available for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateShowtimeSelector;
