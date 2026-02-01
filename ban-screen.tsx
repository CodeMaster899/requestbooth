import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface BanScreenProps {
  banMessage?: string;
  banReason?: string;
  banTimestamp?: string;
}

export default function BanScreen({ 
  banMessage = "Access to this service has been restricted due to violations of our Terms of Service. Please contact support if you believe this is an error.",
  banReason,
  banTimestamp 
}: BanScreenProps) {
  const handleContactSupport = () => {
    window.location.href = "mailto:support@djsystem.com";
  };

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-800 dark:text-red-200">Access Denied</CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Your access to this service has been restricted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              {banMessage}
            </p>
          </div>
          
          {banReason && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Reason:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{banReason}</p>
            </div>
          )}
          
          {banTimestamp && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Date:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(banTimestamp).toLocaleDateString()} at {new Date(banTimestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleContactSupport}
              variant="outline" 
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            
            <div className="pt-4 border-t border-border text-center space-y-2">
              <div className="flex justify-center space-x-4 text-sm">
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                © 2025 RequestBooth. All rights reserved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}