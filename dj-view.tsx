import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { List, Music, BarChart3, Mic, Music2, Bell, QrCode } from "lucide-react";
import RequestQueue from "./request-queue";
import SongLibrary from "./song-library";
import QRCodeDisplay from "./qr-code-display";
import { useQuery } from "@tanstack/react-query";
import type { QueueRequest, RequestStats, SystemStatus } from "@shared/schema";

export default function DJView() {
  const [activeMode, setActiveMode] = useState<"dj" | "karaoke">("dj");
  const [activeTab, setActiveTab] = useState("queue");

  // Get system status to check if karaoke is enabled
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 5000,
  });

  const { data: allQueue = [] } = useQuery<QueueRequest[]>({
    queryKey: ["/api/requests"],
    refetchInterval: 2000, // Refresh every 2 seconds for DJ dashboard
  });

  const { data: stats } = useQuery<RequestStats>({
    queryKey: ["/api/requests/stats"],
    refetchInterval: 5000,
  });

  // Filter queue based on current mode
  const djQueue = useMemo(() => 
    allQueue.filter(request => request.requestType === "dj"), 
    [allQueue]
  );
  
  const karaokeQueue = useMemo(() => 
    allQueue.filter(request => request.requestType === "karaoke"), 
    [allQueue]
  );

  const currentQueue = activeMode === "dj" ? djQueue : karaokeQueue;

  // Count pending requests for notification badges
  const djPendingCount = useMemo(() => 
    djQueue.filter(request => request.status === "pending").length, 
    [djQueue]
  );
  
  const karaokePendingCount = useMemo(() => 
    karaokeQueue.filter(request => request.status === "pending").length, 
    [karaokeQueue]
  );

  const karaokeEnabled = systemStatus?.karaokeEnabled || false;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {activeMode === "dj" ? "DJ Dashboard" : "Karaoke Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {activeMode === "dj" 
              ? "Manage your song library and DJ queue" 
              : "Manage your karaoke queue and performers"
            }
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Live Queue Active</span>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-6">
        <div className="bg-card border border-border rounded-lg p-1 inline-flex">
          <button
            onClick={() => setActiveMode("dj")}
            className={`relative px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeMode === "dj"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="mode-selector-dj"
          >
            <Music2 className="h-4 w-4" />
            DJ Mode
            {djPendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs animate-bounce">
                {djPendingCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveMode("karaoke")}
            disabled={!karaokeEnabled}
            className={`relative px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeMode === "karaoke" && karaokeEnabled
                ? "bg-primary text-primary-foreground shadow-sm"
                : karaokeEnabled
                ? "text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            }`}
            data-testid="mode-selector-karaoke"
          >
            <Mic className="h-4 w-4" />
            Karaoke Mode
            {karaokeEnabled && karaokePendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs animate-bounce">
                {karaokePendingCount}
              </Badge>
            )}
            {!karaokeEnabled && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                WIP
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Karaoke Under Development Notice */}
      {activeMode === "karaoke" && !karaokeEnabled && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-orange-500">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                Karaoke Mode Under Development
              </h3>
              <p className="text-orange-700 dark:text-orange-300 mt-1">
                Karaoke functionality is currently being developed. Check back soon or enable the KARAOKE_ENABLED environment variable to test.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Queue Management
            {currentQueue.filter(r => r.status === "pending").length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {currentQueue.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Song Library
          </TabsTrigger>
          <TabsTrigger value="qr-codes" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-8">
          <RequestQueue 
            queue={currentQueue} 
            isDJView={true} 
            stats={stats}
          />
        </TabsContent>

        <TabsContent value="library" className="mt-8">
          <SongLibrary />
        </TabsContent>

        <TabsContent value="qr-codes" className="mt-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Request QR Codes
              </h3>
              <p className="text-muted-foreground">
                Share these QR codes with guests to let them submit {activeMode} requests directly
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* DJ QR Code */}
              <QRCodeDisplay 
                mode="dj" 
                data-testid="qr-code-display-dj"
              />
              
              {/* Karaoke QR Code */}
              {karaokeEnabled ? (
                <QRCodeDisplay 
                  mode="karaoke" 
                  data-testid="qr-code-display-karaoke"
                />
              ) : (
                <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium text-muted-foreground mb-2">
                    Karaoke QR Code
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Available when karaoke mode is enabled
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Coming Soon
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-8">
          <div className="text-center py-20">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {activeMode === "dj" ? "DJ Analytics" : "Karaoke Analytics"} Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Detailed analytics and insights about your {activeMode} requests will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}