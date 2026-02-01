import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database, Edit, Plus, Music2, Mic, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequestQueue from "@/components/request-queue";
import RequestModal from "@/components/request-modal";
import SongDatabase from "@/components/song-database";
import ManualRequest from "@/components/manual-request";
import type { Song, QueueRequest, SystemStatus } from "@shared/schema";

export default function PublicView() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"database" | "manual">("database");
  const [requestMode, setRequestMode] = useState<"dj" | "karaoke">("dj");

  // Get system status to check if karaoke is enabled
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 10000,
  });

  const { data: queue = [] } = useQuery<QueueRequest[]>({
    queryKey: ["/api/requests"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const handleRequestSong = (song: Song) => {
    setSelectedSong(song);
    setIsRequestModalOpen(true);
  };

  const estimatedWaitTime = Math.max(queue.filter(r => r.status === "pending").length * 4, 0);
  const karaokeEnabled = systemStatus?.karaokeEnabled || false;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">
          Request Your Song
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4">
          Choose from our music database or request a custom song. Help create the perfect playlist for tonight's set!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main Request Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Mode Selector (DJ vs Karaoke) */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Choose Request Type</h3>
              <p className="text-sm text-muted-foreground">
                Select whether you want to request a DJ song or Karaoke performance
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-1 inline-flex w-full max-w-md mx-auto">
              <button
                onClick={() => setRequestMode("dj")}
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  requestMode === "dj"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="mode-selector-dj"
              >
                <Music2 className="h-4 w-4" />
                DJ Request
              </button>
              <button
                onClick={() => setRequestMode("karaoke")}
                disabled={!karaokeEnabled}
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  requestMode === "karaoke" && karaokeEnabled
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : karaokeEnabled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50 cursor-not-allowed"
                }`}
                data-testid="mode-selector-karaoke"
              >
                <Mic className="h-4 w-4" />
                Karaoke Request
                {!karaokeEnabled && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    Soon
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Karaoke Under Development Notice */}
          {requestMode === "karaoke" && !karaokeEnabled && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-orange-500">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    Karaoke Coming Soon!
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 mt-1">
                    We're working hard to bring you karaoke functionality. Check back soon or stick with DJ requests for now!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Mode Indicator */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {requestMode === "dj" ? (
                  <>
                    <Music2 className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">DJ Request Mode</h4>
                      <p className="text-sm text-muted-foreground">Songs will be played by the DJ</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">Karaoke Request Mode</h4>
                      <p className="text-sm text-muted-foreground">Songs for you to perform yourself</p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={requestMode === "dj" ? "default" : "secondary"}>
                {requestMode === "dj" ? "DJ" : "Karaoke"}
              </Badge>
            </div>
          </div>

          {/* Request Type Selector (Database vs Manual) */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="animated-outline-rainbow flex-1 z-10">
              <Button
                onClick={() => setCurrentView("database")}
                variant={currentView === "database" ? "default" : "outline"}
                className="flex-1 py-4 sm:py-6 relative z-10 w-full text-sm sm:text-base"
                data-testid="button-database-view"
              >
                <Database className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Music Database
              </Button>
            </div>
            <div className="animated-outline-electric flex-1 z-10">
              <Button
                onClick={() => setCurrentView("manual")}
                variant={currentView === "manual" ? "default" : "outline"}
                className="flex-1 py-4 sm:py-6 relative z-10 w-full text-sm sm:text-base"
                data-testid="button-manual-request"
              >
                <Edit className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Manual Request
              </Button>
            </div>
          </div>

          {/* Content Area */}
          {currentView === "database" ? (
            <SongDatabase onRequestSong={handleRequestSong} requestMode={requestMode} />
          ) : (
            <ManualRequest requestMode={requestMode} />
          )}
        </div>

        {/* Current Queue Sidebar */}
        <div className="lg:col-span-1">
          <RequestQueue 
            queue={queue} 
            estimatedWaitTime={estimatedWaitTime}
          />
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        selectedSong={selectedSong}
        requestMode={requestMode}
        onRequestSubmitted={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}