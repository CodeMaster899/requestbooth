import { useState } from "react";
import { Link } from "wouter";
import { Music, Settings, LogOut, Lock, Shield, FileText, Trash2, Power, Wrench, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { djLoginSchema, type DJLogin } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DJView from "@/components/dj-view";
import BanList from "@/components/ban-list";
import djLogo from "@assets/1000001580.png";

export default function DJDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("queue");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // System status queries
  const { data: systemStatus, refetch: refetchSystemStatus } = useQuery({
    queryKey: ["/api/system/status"],
    enabled: isAuthenticated,
  });

  // System setting mutation
  const systemSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("POST", "/api/system/setting", { key, value });
      return response.json();
    },
    onSuccess: () => {
      refetchSystemStatus();
      toast({
        title: "Success",
        description: "System setting updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update system setting",
        variant: "destructive",
      });
    },
  });

  const form = useForm<DJLogin>({
    resolver: zodResolver(djLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: DJLogin) => {
      const response = await apiRequest("POST", "/api/auth/dj", data);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Successfully authenticated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearTermsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/terms/clear");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All terms acceptance records cleared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear terms acceptance records",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: DJLogin) => {
    loginMutation.mutate(data);
  };

  const handleSystemToggle = (setting: string, value: boolean) => {
    systemSettingMutation.mutate({ 
      key: setting, 
      value: value.toString() 
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveSection("queue");
    toast({
      title: "Logged out",
      description: "Successfully logged out of DJ dashboard",
    });
  };

  const handleClearTerms = () => {
    if (confirm("Are you sure you want to clear all terms acceptance records? This will require all users to accept terms again.")) {
      clearTermsMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="dj-logo">
                  <div className="dj-logo-inner">
                    <Music className="text-primary-foreground text-sm" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Bonkers Reborn</h1>
                  <p className="text-sm text-muted-foreground">DJ Song Requests</p>
                </div>
              </div>

              <nav className="flex items-center space-x-6">
                <Link href="/">
                  <Button variant="secondary" className="font-medium">
                    <Music className="mr-2 h-4 w-4" />
                    Request Songs
                  </Button>
                </Link>
                <Button variant="default" className="font-medium">
                  <Settings className="mr-2 h-4 w-4" />
                  DJ Dashboard
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Authentication Form */}
        <div className="max-w-md mx-auto mt-20 px-4">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-accent-foreground text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">DJ Dashboard Access</h2>
              <p className="text-muted-foreground mb-6">Enter your credentials to access the DJ controls</p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Authenticating..." : "Access Dashboard"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={djLogo} 
                alt="RequestBooth DJ Logo" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">RequestBooth</h1>
                <p className="text-sm text-muted-foreground">DJ Song Requests</p>
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="secondary" className="font-medium">
                  <Music className="mr-2 h-4 w-4" />
                  Request Songs
                </Button>
              </Link>
              <Button variant="default" className="font-medium">
                <Settings className="mr-2 h-4 w-4" />
                DJ Dashboard
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="font-medium">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* DJ Dashboard Content */}
      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Song Requests</TabsTrigger>
            <TabsTrigger value="bans" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Ban Management
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Terms Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="mt-6">
            <DJView />
          </TabsContent>
          
          <TabsContent value="bans" className="mt-6">
            <BanList />
          </TabsContent>
          
          <TabsContent value="terms" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Terms Acceptance Management
                </CardTitle>
                <CardDescription>
                  Manage user terms acceptance records. Clear all records to require users to accept terms again.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Clear Terms Acceptance Records</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    This action will remove all terms acceptance records from the database. All users will be required to accept the terms again when they next visit the site.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearTerms}
                    disabled={clearTermsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {clearTermsMutation.isPending ? "Clearing..." : "Clear All Terms Records"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
