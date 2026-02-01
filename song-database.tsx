import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Song } from "@shared/schema";

interface SongDatabaseProps {
  onRequestSong: (song: Song) => void;
  requestMode: "dj" | "karaoke";
}

export default function SongDatabase({ onRequestSong, requestMode }: SongDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["/api/songs", { search: searchQuery }],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/songs?search=${encodeURIComponent(searchQuery)}`
        : "/api/songs";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch songs");
      return response.json();
    },
  });

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Search Input */}
      <div>
        <Label htmlFor="songSearch" className="text-sm font-medium text-foreground mb-2 block">
          Search Music Database
        </Label>
        <div className="relative">
          <Input
            id="songSearch"
            type="text"
            placeholder="Search by song title, artist, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base"
            data-testid="input-song-search"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      </div>

      {/* Song Results */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          Available Songs ({songs.length})
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : songs.length === 0 && searchQuery ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No songs found matching your search.</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try searching with different keywords or switch to Manual Request.
              </p>
            </CardContent>
          </Card>
        ) : songs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No songs available in the database yet.</p>
              <p className="text-muted-foreground text-sm mt-2">
                The DJ will add songs soon. Try Manual Request for now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-3 mobile-scroll">
            {songs.map((song: Song) => (
              <Card key={song.id} className="hover:border-accent transition-colors cursor-pointer card-mobile sm:card-tablet lg:hover-desktop" data-testid={`card-song-${song.id}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate text-mobile-lg sm:text-base">{song.title}</h4>
                      <p className="text-muted-foreground text-sm truncate">{song.artist}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {song.genre && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {song.genre}
                          </span>
                        )}
                        {song.duration && (
                          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                            {song.duration}
                          </span>
                        )}
                        {song.requestCount > 0 && (
                          <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                            {song.requestCount} requests
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => onRequestSong(song)}
                      className="font-medium w-full sm:w-auto min-h-[44px] text-base sm:text-sm"
                      size="sm"
                      data-testid={`button-request-${song.id}`}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}