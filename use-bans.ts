import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Ban } from "@shared/schema";

export function useBans() {
  return useQuery({
    queryKey: ["/api/bans"],
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userUuid: string; deviceFingerprint?: string; banReason: string }) => {
      const response = await fetch("/api/bans", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error('Failed to ban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
  });
}

export function useRemoveBan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banId: number) => {
      const response = await fetch(`/api/bans/${banId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to remove ban');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
    },
  });
}

export function useCheckBanStatus() {
  return useMutation({
    mutationFn: async (userUuid: string) => {
      const response = await fetch(`/api/bans/check/${userUuid}`);
      if (!response.ok) throw new Error('Failed to check ban status');
      return response.json();
    },
  });
}