import { useState } from "react";
import { Link } from "wouter";
import { Music, Settings, LogOut, Lock, Shield, FileText, Trash2, Power, Wrench, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { djLoginSchema, type DJLogin, type SystemStatus } from "@shared/schema";
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
  const { data: systemStatus, refetch: refetchSystemStatus } = useQuery<SystemStatus>({
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

  // Clear terms mutation
  const clearTermsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/terms/clear");
      return response.json();
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
                  <h1 className="text-xl font-bold text-foreground">RequestBooth</h1>
                  <p className="text-sm text-muted-foreground">DJ Song Requests</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="outline">
                  <Music className="mr-2 h-4 w-4" />
                  Public View
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Lock className="mr-2 h-5 w-5" />
                DJ Authentication
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the DJ control panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
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
                        <FormLabel>Password</FormLabel>
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

  // Authenticated DJ Dashboard
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
                <p className="text-sm text-muted-foreground">DJ Control Panel</p>
              </div>
            </div>
            
            {/* Navigation Dropdown */}
            <div className="flex items-center space-x-4">
              <Select value={activeSection} onValueChange={setActiveSection}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue">
                    <div className="flex items-center">
                      <Music className="mr-2 h-4 w-4" />
                      Queue Management
                    </div>
                  </SelectItem>
                  <SelectItem value="library">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Song Library
                    </div>
                  </SelectItem>
                  <SelectItem value="bans">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Ban Management
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      System Controls
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* System Status Controls */}
              <div className="flex items-center space-x-3 bg-muted/30 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Power className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Requests</span>
                  <Switch
                    checked={systemStatus?.requestsEnabled ?? true}
                    onCheckedChange={(checked) => handleSystemToggle('requests_enabled', checked)}
                    disabled={systemSettingMutation.isPending}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Maintenance</span>
                  <Switch
                    checked={systemStatus?.maintenanceMode ?? false}
                    onCheckedChange={(checked) => handleSystemToggle('maintenance_mode', checked)}
                    disabled={systemSettingMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Public View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === "queue" && <DJView />}
        {activeSection === "library" && <DJView />}
        {activeSection === "bans" && <BanList />}
        {activeSection === "system" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  System Controls
                </CardTitle>
                <CardDescription>
                  Manage request system status and maintenance modes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <Power className="mr-2 h-4 w-4 text-green-600" />
                        Request System
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {systemStatus?.requestsEnabled ?? true 
                          ? "Users can submit song requests" 
                          : "Song requests are disabled"}
                      </p>
                    </div>
                    <Switch
                      checked={systemStatus?.requestsEnabled ?? true}
                      onCheckedChange={(checked) => handleSystemToggle('requests_enabled', checked)}
                      disabled={systemSettingMutation.isPending}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <Wrench className="mr-2 h-4 w-4 text-orange-600" />
                        Maintenance Mode
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {systemStatus?.maintenanceMode ?? false 
                          ? "System is in maintenance mode" 
                          : "System is operating normally"}
                      </p>
                    </div>
                    <Switch
                      checked={systemStatus?.maintenanceMode ?? false}
                      onCheckedChange={(checked) => handleSystemToggle('maintenance_mode', checked)}
                      disabled={systemSettingMutation.isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage system data and user records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearTerms}
                  disabled={clearTermsMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {clearTermsMutation.isPending ? "Clearing..." : "Clear All Terms Acceptance"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  This will require all users to accept terms again when they visit the site.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}