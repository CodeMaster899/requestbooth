import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Song, InsertSong } from "@shared/schema";

export function useSongs(searchQuery?: string) {
  return useQuery({
    queryKey: ["/api/songs", { search: searchQuery }],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/songs?search=${encodeURIComponent(searchQuery)}`
        : "/api/songs";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch songs");
      return response.json() as Promise<Song[]>;
    },
  });
}

export function useCreateSong() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertSong) => {
      const response = await apiRequest("POST", "/api/songs", data);
      return response.json() as Promise<Song>;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song added successfully!",
      });
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
}

export function useUpdateSong() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertSong }) => {
      const response = await apiRequest("PUT", `/api/songs/${id}`, data);
      return response.json() as Promise<Song>;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song updated successfully!",
      });
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
}

export function useDeleteSong() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
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
}
