import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import djLogo from "@assets/1000001580.png";

interface OfflineScreenProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function OfflineScreen({ onRetry, isRetrying = false }: OfflineScreenProps) {
  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-orange-200 dark:border-orange-800 card-mobile sm:card-tablet">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-orange-800 dark:text-orange-200 text-mobile-lg sm:text-xl">
            Connection Lost
          </CardTitle>
          <CardDescription className="text-orange-600 dark:text-orange-400">
            RequestBooth needs an internet connection to work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-2">
                  Offline Mode
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                  RequestBooth requires an internet connection to access the song database, 
                  submit requests, and sync with the DJ system. Please check your connection 
                  and try again.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Troubleshooting Steps:
            </h4>
            <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Check your WiFi or cellular connection</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Make sure you're connected to the event's network</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Contact the event staff if the problem persists</span>
              </li>
            </ul>
          </div>

          {onRetry && (
            <div className="pt-2">
              <Button 
                onClick={onRetry}
                disabled={isRetrying}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white min-h-[44px]"
                data-testid="button-retry-connection"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Checking Connection...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="pt-6 border-t border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <img 
                src={djLogo} 
                alt="RequestBooth Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
              <span className="font-bold text-lg text-orange-900 dark:text-orange-100">RequestBooth</span>
            </div>
            <p className="text-xs text-center text-orange-600 dark:text-orange-400">
              Professional DJ Song Request Platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}