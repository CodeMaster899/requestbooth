import { Download, Monitor, Smartphone, Shield, Zap, Wifi, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import djLogo from "@assets/1000001580.png";

export default function DownloadPage() {
  const currentVersion = "1.0.0";
  const releaseDate = "September 28, 2025";
  const fileSize = "~15 MB";

  const handleDownload = () => {
    // Show alert since installer is not built yet (requires Rust 1.82+)
    alert(
      "Desktop Installer Coming Soon!\n\n" +
      "The Windows installer requires Rust 1.82+ to build.\n\n" +
      "To build the installer:\n" +
      "1. Install Rust 1.82 or higher\n" +
      "2. Run: npm run tauri build\n\n" +
      "The installer will be available at:\n" +
      "src-tauri/target/release/bundle/nsis/RequestBooth_1.0.0_x64-setup.exe\n\n" +
      "For now, please use the web version at the home page."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
      {/* Header */}
      <div className="bg-white dark:bg-orange-950 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <img 
              src={djLogo} 
              alt="RequestBooth Logo" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                RequestBooth Desktop
              </h1>
              <p className="text-orange-600 dark:text-orange-400">
                Professional DJ Song Request Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Main Download Section */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
              Download for Windows
            </h2>
            <p className="text-lg text-orange-700 dark:text-orange-300 max-w-2xl mx-auto">
              Get the full desktop experience with enhanced performance, 
              offline capabilities, and native Windows integration.
            </p>
          </div>

          <Card className="max-w-md mx-auto border-orange-200 dark:border-orange-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-orange-900 dark:text-orange-100">
                RequestBooth Desktop
              </CardTitle>
              <CardDescription>
                Version {currentVersion} • {fileSize}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleDownload}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6"
                data-testid="button-download-desktop"
              >
                <Download className="mr-2 h-5 w-5" />
                Download for Windows
              </Button>
              <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                Released {releaseDate} • Windows 10/11 (64-bit)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Web Version */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Web Version
                </CardTitle>
              </div>
              <CardDescription>
                Access from any device with a web browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Works on all devices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">No installation required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Automatic updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Requires internet connection</span>
                </div>
              </div>
              <Separator />
              <Button 
                variant="outline" 
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950"
                onClick={() => window.location.href = "/"}
                data-testid="button-use-web-version"
              >
                Use Web Version
              </Button>
            </CardContent>
          </Card>

          {/* Desktop Version */}
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Monitor className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Desktop Version
                </CardTitle>
                <Badge variant="secondary" className="bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                  Recommended
                </Badge>
              </div>
              <CardDescription>
                Enhanced performance and native features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Enhanced performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Offline detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Native notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Auto-updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">System tray integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-orange-900 dark:text-orange-100">
            Why Choose Desktop?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  Lightning Fast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Native performance with faster load times and smoother animations 
                  compared to browser-based versions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <Wifi className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  Offline Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Smart offline detection shows helpful messages when connection 
                  is lost, with automatic reconnection attempts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  Auto Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Automatically checks for and installs updates, ensuring you 
                  always have the latest features and security improvements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Requirements */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              System Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
                  Minimum Requirements
                </h4>
                <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                  <li>• Windows 10 (64-bit)</li>
                  <li>• 2 GB RAM</li>
                  <li>• 50 MB available storage</li>
                  <li>• Internet connection required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
                  Recommended
                </h4>
                <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                  <li>• Windows 11 (64-bit)</li>
                  <li>• 4 GB RAM or more</li>
                  <li>• 100 MB available storage</li>
                  <li>• Stable broadband connection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/30">
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Need Help?
            </h3>
            <p className="text-orange-700 dark:text-orange-300 mb-4 max-w-md mx-auto">
              Having trouble with installation or need technical support? 
              Our team is here to help you get RequestBooth running smoothly.
            </p>
            <Button 
              variant="outline" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-800"
              onClick={() => window.location.href = "/support"}
              data-testid="button-get-support"
            >
              Get Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}