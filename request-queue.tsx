import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, SkipForward, X, Trash2, Plus, Ban, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useBanUser } from "@/hooks/use-bans";
import type { QueueRequest, RequestStats } from "@shared/schema";

interface RequestQueueProps {
  queue: QueueRequest[];
  estimatedWaitTime?: number;
  isDJView?: boolean;
  stats?: RequestStats;
}

export default function RequestQueue({ 
  queue, 
  estimatedWaitTime, 
  isDJView = false, 
  stats 
}: RequestQueueProps) {
  const [banReason, setBanReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<QueueRequest | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const banUserMutation = useBanUser();

  const updateStatusMutation = useMutation({
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

  const deleteRequestMutation = useMutation({
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

  const clearCompletedMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/requests/completed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/stats"] });
      toast({
        title: "Success",
        description: "Completed requests cleared",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/requests");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/stats"] });
      toast({
        title: "Success",
        description: "All requests cleared",
      });
    },
  });

  const handleMarkPlayed = (id: number) => {
    updateStatusMutation.mutate({ id, status: "played" });
  };

  const handleMarkSkipped = (id: number) => {
    updateStatusMutation.mutate({ id, status: "skipped" });
  };

  const handleRemoveRequest = (id: number) => {
    deleteRequestMutation.mutate(id);
  };

  const handleBanUser = (request: QueueRequest) => {
    if (!request.userUuid) {
      toast({
        title: "Error",
        description: "Cannot ban user - no user ID available",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedRequest(request);
  };

  const confirmBan = () => {
    if (!selectedRequest || !selectedRequest.userUuid || !banReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ban reason",
        variant: "destructive",
      });
      return;
    }

    banUserMutation.mutate(
      {
        userUuid: selectedRequest.userUuid,
        deviceFingerprint: selectedRequest.deviceFingerprint || undefined,
        banReason: banReason.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: "User Banned",
            description: `User ${selectedRequest.requesterName} has been banned and their requests removed`,
          });
          setSelectedRequest(null);
          setBanReason("");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to ban user",
            variant: "destructive",
          });
        },
      }
    );
  };

  const pendingQueue = queue.filter(r => r.status === "pending");
  const completedQueue = queue.filter(r => r.status === "played" || r.status === "skipped");

  if (isDJView) {
    return (
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Queue */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">Request Queue</h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCompletedMutation.mutate()}
                disabled={clearCompletedMutation.isPending || completedQueue.length === 0}
              >
                <Check className="mr-1 h-4 w-4" />
                Clear Completed
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => clearAllMutation.mutate()}
                disabled={clearAllMutation.isPending || queue.length === 0}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {queue.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No requests in queue</p>
                </CardContent>
              </Card>
            ) : (
              queue.map((request, index) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-mono text-accent">#{index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            request.status === "pending" ? "default" :
                            request.status === "played" ? "secondary" :
                            request.status === "skipped" ? "outline" : "destructive"
                          }>
                            {request.isManualRequest ? "Manual Request" : request.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {request.timestamp ? new Date(request.timestamp).toLocaleTimeString() : ""}
                          </span>
                        </div>
                      </div>
                      {request.status === "pending" && isDJView && (
                        <div className="flex items-center space-x-2">
                          {request.isManualRequest && (
                            <Button
                              size="sm"
                              variant="outline"
                              title="Add to Library"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPlayed(request.id)}
                            title="Mark as Played"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSkipped(request.id)}
                            title="Skip"
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveRequest(request.id)}
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {request.userUuid && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(request)}
                              title="Ban User"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium text-foreground">{request.songTitle}</h4>
                        <p className="text-muted-foreground text-sm">{request.songArtist}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Version</p>
                        <p className="text-accent font-medium">{request.songVersion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requested by</p>
                        <p className="text-accent font-medium">{request.requesterName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {request.notes ? "Notes" : "Type"}
                        </p>
                        <p className="text-foreground text-sm">
                          {request.notes || (request.isManualRequest ? "Manual Request" : "Library Song")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Queue Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total Requests</span>
                    <span className="text-foreground font-semibold">{stats.totalRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Pending</span>
                    <span className="text-blue-400 font-semibold">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Completed</span>
                    <span className="text-green-400 font-semibold">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Manual Requests</span>
                    <span className="text-yellow-400 font-semibold">{stats.manual}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Public view
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <span>Current Queue</span>
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {pendingQueue.length} songs
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingQueue.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No songs in queue</p>
        ) : (
          pendingQueue.slice(0, 5).map((request, index) => (
            <div key={request.id} className="p-3 bg-muted/30 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono text-accent">#{index + 1}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {request.timestamp ? new Date(request.timestamp).toLocaleTimeString() : ""}
                </span>
              </div>
              <h4 className="font-medium text-foreground text-sm">{request.songTitle}</h4>
              <p className="text-muted-foreground text-xs">{request.songArtist}</p>
              <p className="text-blue-600 text-xs font-medium">{request.songVersion} Version</p>
              <p className="text-accent text-xs mt-1">Requested by {request.requesterName}</p>
            </div>
          ))
        )}

        {/* Queue Status */}
        {estimatedWaitTime !== undefined && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated wait:</span>
              <span className="text-accent font-mono">~{estimatedWaitTime} min</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Ban Dialog Component
function BanDialog({
  isOpen,
  onClose,
  onConfirm,
  request,
  banReason,
  setBanReason,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: QueueRequest | null;
  banReason: string;
  setBanReason: (reason: string) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            Ban User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              This will permanently ban user <strong>{request?.requesterName}</strong> and remove all their active requests.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ban Reason:</label>
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for ban..."
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={!banReason.trim()}
          >
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
