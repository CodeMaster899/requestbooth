import { Download, X, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdater } from "@/hooks/use-updater";

export default function UpdateNotification() {
  const {
    updateAvailable,
    updateInfo,
    isChecking,
    isUpdating,
    downloadProgress,
    error,
    isTauri,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
    clearError,
  } = useUpdater();

  // Don't render if not in Tauri
  if (!isTauri) {
    return null;
  }

  // Don't render if not in Tauri and no activity
  if (!isTauri || (!updateAvailable && !isChecking && !isUpdating && !error)) {
    // In Tauri, show a minimal idle state for manual checking
    if (isTauri && !updateAvailable && !isChecking && !isUpdating && !error) {
      return (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={checkForUpdates}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950"
            data-testid="button-check-updates-idle"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Updates
          </Button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isUpdating ? (
                <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-spin" />
              ) : updateAvailable ? (
                <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              ) : isChecking ? (
                <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-spin" />
              ) : error ? (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : null}
              
              <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                {isUpdating ? 'Installing Update' : 
                 updateAvailable ? 'Update Available' :
                 isChecking ? 'Checking for Updates' :
                 error ? 'Update Error' : 'RequestBooth Updates'}
              </CardTitle>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={error ? clearError : dismissUpdate}
              className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-800"
              data-testid="button-close-update-notification"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error State */}
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Update Available */}
          {updateAvailable && updateInfo && !isUpdating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  Version {updateInfo.version} is available
                </CardDescription>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                  New
                </Badge>
              </div>
              
              {updateInfo.body && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/50 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200 whitespace-pre-wrap">
                    {updateInfo.body}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={downloadAndInstall}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="button-install-update"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install Update
                </Button>
                <Button
                  variant="outline"
                  onClick={dismissUpdate}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950"
                  data-testid="button-dismiss-update"
                >
                  Later
                </Button>
              </div>
            </div>
          )}

          {/* Downloading/Installing Progress */}
          {isUpdating && downloadProgress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-700 dark:text-orange-300">
                  Downloading update...
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {Math.round(downloadProgress.percentage)}%
                </span>
              </div>
              
              <Progress 
                value={downloadProgress.percentage} 
                className="h-2"
              />
              
              {downloadProgress.contentLength && (
                <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
                  <span>
                    {(downloadProgress.downloaded / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <span>
                    {(downloadProgress.contentLength / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              )}

              {downloadProgress.percentage >= 100 && (
                <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>Download complete. Installing...</span>
                </div>
              )}
            </div>
          )}

          {/* Checking State */}
          {isChecking && !updateAvailable && (
            <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking for updates...</span>
            </div>
          )}

          {/* Manual Check Button (when idle) */}
          {!updateAvailable && !isChecking && !isUpdating && !error && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={checkForUpdates}
                className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950"
                data-testid="button-check-updates"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for Updates
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}