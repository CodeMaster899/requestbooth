import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type Song, type InsertRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface SongSearchProps {
  onRequestSong: (song: Song) => void;
}

const manualRequestSchema = insertRequestSchema.extend({
  requesterName: z.string().min(1, "Name is required"),
});

type ManualRequest = z.infer<typeof manualRequestSchema>;

export default function SongSearch({ onRequestSong }: SongSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ManualRequest>({
    resolver: zodResolver(manualRequestSchema),
    defaultValues: {
      songTitle: "",
      songArtist: "",
      requesterName: "",
      notes: "",
      isManualRequest: true,
      status: "pending",
    },
  });

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

  const manualRequestMutation = useMutation({
    mutationFn: async (data: ManualRequest) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Manual request submitted successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit manual request",
        variant: "destructive",
      });
    },
  });

  const handleManualRequest = (data: ManualRequest) => {
    manualRequestMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div>
        <Label htmlFor="songSearch" className="text-sm font-medium text-foreground mb-2 block">
          Search Song Library
        </Label>
        <div className="relative">
          <Input
            id="songSearch"
            type="text"
            placeholder="Search by song title, artist, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      </div>

      {/* Song Results */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Songs</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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
            </CardContent>
          </Card>
        ) : (
          songs.map((song: Song) => (
            <Card key={song.id} className="hover:border-accent transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{song.title}</h4>
                    <p className="text-muted-foreground text-sm">{song.artist}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {song.genre} • {song.duration}
                    </p>
                  </div>
                  <Button 
                    onClick={() => onRequestSong(song)}
                    className="font-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Manual Request Section */}
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Edit className="mr-2 text-accent h-5 w-5" />
            Can't Find Your Song?
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Request a song that's not in our library. The DJ will consider adding it!
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleManualRequest)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="songTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter song title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="songArtist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter artist name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Request (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special notes for the DJ..."
                        rows={2}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit"
                className="w-full bg-destructive hover:bg-destructive/90"
                disabled={manualRequestMutation.isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {manualRequestMutation.isPending ? "Submitting..." : "Submit Manual Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
