import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSongSchema, type Song, type InsertSong } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SongLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSong>({
    resolver: zodResolver(insertSongSchema),
    defaultValues: {
      title: "",
      artist: "",
      genre: "",
      duration: "",
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

  const createSongMutation = useMutation({
    mutationFn: async (data: InsertSong) => {
      const response = await apiRequest("POST", "/api/songs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song added successfully!",
      });
      form.reset();
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add song",
        variant: "destructive",
      });
    },
  });

  const updateSongMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertSong }) => {
      const response = await apiRequest("PUT", `/api/songs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song updated successfully!",
      });
      form.reset();
      setEditingSong(null);
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update song",
        variant: "destructive",
      });
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/songs/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete song",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertSong) => {
    if (editingSong) {
      updateSongMutation.mutate({ id: editingSong.id, data });
    } else {
      createSongMutation.mutate(data);
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    form.reset({
      title: song.title,
      artist: song.artist,
      genre: song.genre || "",
      duration: song.duration || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this song?")) {
      deleteSongMutation.mutate(id);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingSong(null);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Song Library Management</h3>
        <Dialog open={isAddDialogOpen || !!editingSong} onOpenChange={(open) => {
          if (!open) resetForm();
          else setIsAddDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Song
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSong ? "Edit Song" : "Add New Song"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
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
                  name="artist"
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Rock, Pop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 3:45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createSongMutation.isPending || updateSongMutation.isPending}
                  >
                    {createSongMutation.isPending || updateSongMutation.isPending
                      ? "Saving..."
                      : editingSong ? "Update Song" : "Add Song"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Library Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search library by title, artist, or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>

      {/* Library Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Song</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : songs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchQuery ? "No songs found matching your search." : "No songs in library."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  songs.map((song: Song) => (
                    <TableRow key={song.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{song.title}</TableCell>
                      <TableCell className="text-muted-foreground">{song.artist}</TableCell>
                      <TableCell className="text-muted-foreground">{song.genre || "-"}</TableCell>
                      <TableCell className="text-muted-foreground font-mono">{song.duration || "-"}</TableCell>
                      <TableCell className="text-accent font-medium">{song.requestCount || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(song)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(song.id)}
                            disabled={deleteSongMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
