import { useState } from "react";
import { Trash2, AlertTriangle, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Ban } from "@shared/schema";

export default function BanList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bans = [], isLoading } = useQuery<Ban[]>({
    queryKey: ["/api/bans"],
  });

  const deleteBanMutation = useMutation({
    mutationFn: async (banId: number) => {
      return await fetch(`/api/bans/${banId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bans"] });
      toast({
        title: "Success",
        description: "User ban has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove ban",
        variant: "destructive",
      });
    },
  });

  const handleRemoveBan = (ban: Ban) => {
    if (confirm(`Remove ban for user ${ban.userUuid}?`)) {
      deleteBanMutation.mutate(ban.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ban List</CardTitle>
          <CardDescription>Loading banned users...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Ban List
        </CardTitle>
        <CardDescription>
          Manage banned users - {bans.length} total banned
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No banned users</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bans.map((ban: Ban) => (
              <div
                key={ban.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{ban.userUuid}</span>
                    <Badge variant="destructive">Banned</Badge>
                  </div>
                  
                  {ban.deviceFingerprint && (
                    <div className="text-sm text-muted-foreground">
                      Device: {ban.deviceFingerprint}
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <strong>Reason:</strong> {ban.banReason}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Banned on {new Date(ban.banTimestamp!).toLocaleDateString()} at{" "}
                    {new Date(ban.banTimestamp!).toLocaleTimeString()}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveBan(ban)}
                  disabled={deleteBanMutation.isPending}
                  className="ml-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Ban
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}