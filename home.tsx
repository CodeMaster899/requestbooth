import { Link } from "wouter";
import { Music, Settings, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicView from "@/components/public-view";
import djLogo from "@assets/1000001580.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 nav-mobile backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="animated-outline-pulse z-10">
                <img 
                  src={djLogo} 
                  alt="RequestBooth DJ Logo" 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover relative z-10"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">RequestBooth</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">DJ Song Requests</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <div className="animated-outline-electric z-10">
                <Button variant="default" className="font-medium relative z-10">
                  <Music className="mr-2 h-4 w-4" />
                  Request Songs
                </Button>
              </div>
              <Link href="/dj">
                <div className="animated-outline-wave z-10">
                  <Button variant="secondary" className="font-medium relative z-10">
                    <Settings className="mr-2 h-4 w-4" />
                    DJ Dashboard
                  </Button>
                </div>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="font-medium">
                  <Heart className="mr-2 h-4 w-4" />
                  Support
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
              <Link href="/support">
                <Button variant="outline" size="sm" className="px-2 py-2 min-h-[44px]" data-testid="button-mobile-support">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dj">
                <Button variant="outline" size="sm" className="px-2 sm:px-3 py-2 min-h-[44px]" data-testid="button-mobile-dj">
                  <Settings className="h-4 w-4" />
                  <span className="ml-1 text-xs hidden sm:inline">DJ</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <PublicView />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-center sm:text-left">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © 2025 RequestBooth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
