import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { getUserIdentification } from "@/lib/userUtils";
import type { SystemStatus } from "@shared/schema";

export default function TermsPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [location] = useLocation();

  // Check system status - only show terms when requests are enabled
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    // Only check terms acceptance when requests are enabled
    if (!systemStatus || !systemStatus.requestsEnabled) {
      setInitialCheckDone(true);
      setIsOpen(false);
      return;
    }

    // Check if user has already accepted terms in database
    const checkTermsAcceptance = async () => {
      try {
        const { userUuid } = getUserIdentification();
        const response = await fetch(`/api/terms/check/${userUuid}`);
        const data = await response.json();
        
        setHasAcceptedTerms(data.hasAccepted);
        setInitialCheckDone(true);
        
        if (!data.hasAccepted && location !== '/terms') {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error checking terms acceptance:", error);
        setInitialCheckDone(true);
        if (location !== '/terms') {
          setIsOpen(true);
        }
      }
    };

    if (!initialCheckDone) {
      checkTermsAcceptance();
    }
  }, [location, initialCheckDone, systemStatus]);

  useEffect(() => {
    // Handle navigation between terms page and other pages - only when requests are enabled
    if (!initialCheckDone || !systemStatus?.requestsEnabled) return;
    
    if (location === '/terms') {
      setIsOpen(false);
    } else if (!hasAcceptedTerms) {
      setIsOpen(true);
    }
  }, [location, hasAcceptedTerms, initialCheckDone, systemStatus]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { userUuid, deviceFingerprint } = getUserIdentification();
      const response = await fetch("/api/terms/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userUuid,
          deviceFingerprint,
        }),
      });

      if (response.ok) {
        setHasAcceptedTerms(true);
        setIsOpen(false);
      } else {
        console.error("Failed to record terms acceptance");
      }
    } catch (error) {
      console.error("Error recording terms acceptance:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <DialogTitle>Terms of Service</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p>
              While using this DJ song request system, you must follow our Terms of Service.
            </p>
            <p className="font-medium text-foreground">
              Explicit songs are allowed but depend on the event type. For family/kids events, restrictions may apply based on client preferences.
            </p>
            <p className="text-sm text-muted-foreground">
              No trolling requests or inappropriate behavior. Violations may result in permanent ban from this service.
            </p>
            <div className="mt-4 pt-3 border-t border-border">
              <Link href="/terms" className="text-sm text-primary hover:underline flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                Read full Terms of Service
              </Link>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            className="w-full"
            disabled={isAccepting}
          >
            <Check className="w-4 h-4 mr-2" />
            {isAccepting ? "Recording..." : "I Understand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}