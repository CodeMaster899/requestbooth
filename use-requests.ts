import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QueueRequest, InsertRequest, RequestStats } from "@shared/schema";

export function useRequests() {
  return useQuery({
    queryKey: ["/api/requests"],
    queryFn: async () => {
      const response = await fetch("/api/requests");
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json() as Promise<QueueRequest[]>;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useRequestStats() {
  return useQuery({
    queryKey: ["/api/requests/stats"],
    queryFn: async () => {
      const response = await fetch("/api/requests/stats");
      if (!response.ok) throw new Error("Failed to fetch request stats");
      return response.json() as Promise<RequestStats>;
    },
    refetchInterval: 5000,
  });
}

export function useCreateRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertRequest) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRequestStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete request",
        variant: "destructive",
      });
    },
  });
}

export function useClearRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: "completed" | "all") => {
      const endpoint = type === "completed" ? "/api/requests/completed" : "/api/requests";
      await apiRequest("DELETE", endpoint);
    },
    onSuccess: (_, type) => {
      toast({
        title: "Success",
        description: `${type === "completed" ? "Completed requests" : "All requests"} cleared`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear requests",
        variant: "destructive",
      });
    },
  });
}
