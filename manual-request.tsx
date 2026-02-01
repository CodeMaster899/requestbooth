import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type InsertRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const manualRequestSchema = insertRequestSchema.extend({
  requesterName: z.string().min(2, "Your name is required (minimum 2 characters)").max(50, "Name too long"),
  songTitle: z.string().min(2, "Song title is required (minimum 2 characters)").max(100, "Song title too long"),
  songArtist: z.string().min(2, "Artist name is required (minimum 2 characters)").max(100, "Artist name too long"),
  notes: z.string().optional(),
});

type ManualRequest = z.infer<typeof manualRequestSchema>;

interface ManualRequestProps {
  requestMode: "dj" | "karaoke";
}

export default function ManualRequest({ requestMode }: ManualRequestProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ManualRequest>({
    resolver: zodResolver(manualRequestSchema),
    defaultValues: {
      songTitle: "",
      songArtist: "",
      songVersion: requestMode === "karaoke" ? "Karaoke" : "Standard",
      requestType: requestMode,
      requesterName: "",
      notes: "",
      isManualRequest: true,
      status: "pending",
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
    <Card className="border-2 border-dashed border-muted">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Request a Custom Song
          </h3>
          <p className="text-muted-foreground text-sm">
            Can't find your song in our database? Request it here and the DJ will consider adding it to the playlist!
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleManualRequest)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="songTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Title * (Required)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter exact song title" 
                        {...field}
                        className={form.formState.errors.songTitle ? "border-red-500" : ""}
                      />
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
                    <FormLabel>Artist * (Required)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter artist/band name" 
                        {...field}
                        className={form.formState.errors.songArtist ? "border-red-500" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Request (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special notes for the DJ..."
                      rows={3}
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit"
              className="w-full bg-destructive hover:bg-destructive/90 py-3"
              disabled={manualRequestMutation.isPending || !form.formState.isValid}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {manualRequestMutation.isPending ? "Submitting..." : "Submit Manual Request"}
            </Button>
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm text-center">
                Please fill in all required fields before submitting
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}