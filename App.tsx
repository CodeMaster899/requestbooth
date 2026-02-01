import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import DJDashboard from "@/pages/dj-dashboard-new";
import KaraokeTV from "@/pages/karaoke-tv";
import Support from "@/pages/support";
import DownloadPage from "@/pages/download";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import NotFound from "@/pages/not-found";
import BanScreen from "@/components/ban-screen";
import BanPopup from "@/components/ban-popup";
import RequestsDisabledScreen from "@/components/requests-disabled-screen";
import MaintenanceScreen from "@/components/maintenance-screen";
import OfflineScreen from "@/components/offline-screen";
import UpdateNotification from "@/components/update-notification";
import TermsPopup from "@/components/terms-popup";
import { getUserIdentification } from "@/lib/userUtils";
import { useOnline } from "@/hooks/use-online";
import { type SystemStatus, type Ban } from "@shared/schema";

type BanCheckResponse = {
  status: "banned" | "allowed";
  message?: string;
  banReason?: string;
  banTimestamp?: string;
  ban?: Ban;
};

function Router() {
  const { userUuid } = getUserIdentification();
  const [showBanPopup, setShowBanPopup] = useState(false);
  const { isOnline, isChecking, checkOnlineStatus } = useOnline();

  // Check system status for maintenance mode and request status
  const { data: systemStatus, isLoading: isLoadingSystemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
  });

  // Check if user is banned
  const { data: banStatus, isLoading: isLoadingBanStatus } = useQuery<BanCheckResponse>({
    queryKey: ["/api/bans/check", userUuid],
  });

  // Check DJ auth status for override
  const { data: authStatus } = useQuery<{ isDJ: boolean; overrideActive: boolean }>({
    queryKey: ["/api/auth/me"],
  });


  // Show ban popup immediately when user is detected as banned
  useEffect(() => {
    if (banStatus?.status === "banned" && !showBanPopup) {
      setShowBanPopup(true);
      // Auto-close popup after 5 seconds to show full ban screen
      setTimeout(() => {
        setShowBanPopup(false);
      }, 5000);
    }
  }, [banStatus, showBanPopup]);

  // Show loading while checking system status and ban status
  if (isLoadingSystemStatus || isLoadingBanStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show offline screen if no internet connection
  if (!isOnline) {
    return (
      <OfflineScreen 
        onRetry={checkOnlineStatus}
        isRetrying={isChecking}
      />
    );
  }

  // Show maintenance screen if maintenance mode is enabled (DJ dashboard still accessible)
  if (systemStatus?.maintenanceMode) {
    return (
      <>
        {!authStatus?.isDJ && <TermsPopup />}
        <Switch>
          <Route path="/dj" component={DJDashboard} />
          <Route path="/karaoke/tv" component={KaraokeTV} />
          <Route path="/support" component={Support} />
          <Route path="/download" component={DownloadPage} />
          <Route path="*" component={MaintenanceScreen} />
        </Switch>
      </>
    );
  }

  // Show banned screen if user is banned
  if (banStatus?.status === "banned") {
    return (
      <BanScreen 
        banMessage={banStatus.ban?.banReason}
        banReason={banStatus.ban?.banReason}
        banTimestamp={banStatus.ban?.banTimestamp?.toString()}
      />
    );
  }

  // Show requests disabled screen if requests are disabled AND user is not authenticated as DJ
  if (systemStatus?.requestsEnabled === false && !authStatus?.isDJ) {
    return (
      <>
        <TermsPopup />
        <Switch>
          <Route path="/dj" component={DJDashboard} />
          <Route path="/karaoke/tv" component={KaraokeTV} />
          <Route path="/support" component={Support} />
          <Route path="/download" component={DownloadPage} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="*" component={RequestsDisabledScreen} />
        </Switch>
      </>
    );
  }

  return (
    <>
      {!authStatus?.isDJ && <TermsPopup />}
      
      {/* Ban popup - shows immediately when user is banned */}
      <BanPopup
        isOpen={showBanPopup}
        banReason={banStatus?.ban?.banReason}
        banTimestamp={banStatus?.ban?.banTimestamp ? banStatus.ban.banTimestamp.toString() : undefined}
        isPermanent={banStatus?.ban?.isPermanent !== false}
        expiresAt={banStatus?.ban?.expiresAt ? banStatus.ban.expiresAt.toString() : undefined}
      />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dj" component={DJDashboard} />
        <Route path="/karaoke/tv" component={KaraokeTV} />
        <Route path="/support" component={Support} />
        <Route path="/download" component={DownloadPage} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <Toaster />
          <UpdateNotification />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
