import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Music, Power, Calendar, Clock, Key, Eye, EyeOff, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import djLogo from "@assets/1000001580.png";

export default function RequestsDisabledScreen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showOverride, setShowOverride] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const overrideMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/system/override", { username, password });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "DJ Override Successful",
        description: "You now have access to the system",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Override Failed", 
        description: error.message || "Invalid DJ credentials",
        variant: "destructive",
      });
      setPassword("");
    },
  });

  const handleOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    overrideMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">System Currently Offline</CardTitle>
          <CardDescription className="text-lg">
            RequestBooth is not currently active for an event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Power className="h-5 w-5" />
              <span className="text-sm font-medium">Song requests are disabled between events</span>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800 leading-relaxed">
                RequestBooth is designed for live DJ events and performances. When no event is active, 
                the song request system is temporarily disabled to maintain optimal performance and prevent 
                unnecessary database activity.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Check back during our next live event</span>
            </div>
          </div>

          {/* DJ Override Section */}
          <Separator />
          <div className="pt-4">
            {!showOverride ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverride(true)}
                className="flex items-center gap-2"
                data-testid="button-show-override"
              >
                <Key className="h-4 w-4" />
                DJ Override
              </Button>
            ) : (
              <form onSubmit={handleOverride} className="space-y-4">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    DJ Override Access
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your DJ credentials to access the system while requests are disabled
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter DJ username"
                        required
                        data-testid="input-override-username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter DJ password"
                          required
                          data-testid="input-override-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={overrideMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit-override"
                  >
                    {overrideMutation.isPending ? "Authenticating..." : "Access System"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowOverride(false);
                      setUsername("");
                      setPassword("");
                    }}
                    data-testid="button-cancel-override"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          <Separator className="my-4" />
          
          <div className="pt-2">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <img 
                src={djLogo} 
                alt="RequestBooth Logo" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="font-bold text-xl">RequestBooth</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Professional DJ Song Request Platform
            </p>
            
            {/* Support Button */}
            <div className="mb-4">
              <a href="/support" className="w-full">
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Support RequestBooth
                </Button>
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              © 2025 RequestBooth. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}