import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type Song, type InsertRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUserIdentification } from "@/lib/userUtils";
import { z } from "zod";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSong: Song | null;
  requestMode: "dj" | "karaoke";
  onRequestSubmitted: () => void;
}

const requestFormSchema = insertRequestSchema.extend({
  requesterName: z.string().min(2, "Your name is required (minimum 2 characters)").max(50, "Name too long"),
  songTitle: z.string().min(1, "Song title is required"),
  songArtist: z.string().min(1, "Artist name is required"),
  notes: z.string().optional(),
});

type RequestForm = z.infer<typeof requestFormSchema>;

export default function RequestModal({ 
  isOpen, 
  onClose, 
  selectedSong, 
  requestMode,
  onRequestSubmitted 
}: RequestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      songId: selectedSong?.id || undefined,
      songTitle: selectedSong?.title || "",
      songArtist: selectedSong?.artist || "",
      songVersion: requestMode === "karaoke" ? "Karaoke" : "Standard",
      requestType: requestMode,
      requesterName: "",
      notes: "",
      status: "pending",
      isManualRequest: false,
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: RequestForm) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song request submitted successfully!",
      });
      form.reset();
      onRequestSubmitted();
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: RequestForm) => {
    const { userUuid, deviceFingerprint } = getUserIdentification();
    
    const requestData: InsertRequest = {
      songId: selectedSong?.id || null,
      songTitle: selectedSong?.title || data.songTitle,
      songArtist: selectedSong?.artist || data.songArtist,
      songVersion: data.songVersion,
      requestType: requestMode,
      requesterName: data.requesterName,
      notes: data.notes ? data.notes : undefined,
      status: "pending",
      isManualRequest: !selectedSong,
      userUuid,
      deviceFingerprint,
    };

    requestMutation.mutate(requestData);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Update form when selected song changes
  if (selectedSong && form.getValues("songId") !== selectedSong.id) {
    form.reset({
      songId: selectedSong.id,
      songTitle: selectedSong.title,
      songArtist: selectedSong.artist,
      requesterName: form.getValues("requesterName"),
      notes: form.getValues("notes"),
      status: "pending",
      isManualRequest: false,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Request Song
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {selectedSong && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Song</label>
                <div className="p-3 bg-muted border border-border rounded-lg">
                  <div className="font-medium text-foreground">{selectedSong.title}</div>
                  <div className="text-muted-foreground text-sm">{selectedSong.artist}</div>
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="requesterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name * (Required)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field}
                      className={form.formState.errors.requesterName ? "border-red-500" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="songVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Song Version * (Required)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={form.formState.errors.songVersion ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Standard">Standard Version</SelectItem>
                      <SelectItem value="Karaoke">Karaoke Version</SelectItem>
                    </SelectContent>
                  </Select>
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
            
            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={requestMutation.isPending || !form.formState.isValid}
              >
                <Plus className="mr-2 h-4 w-4" />
                {requestMutation.isPending ? "Adding..." : "Add to Queue"}
              </Button>
            </div>
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm text-center mt-2">
                Please fill in all required fields before submitting
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
