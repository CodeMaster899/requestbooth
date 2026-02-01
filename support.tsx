import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import djLogo from "@assets/1000001580.png";

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <img 
                src={djLogo} 
                alt="RequestBooth Logo" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">RequestBooth</h1>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>

            {/* Back Button */}
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Support RequestBooth</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help keep RequestBooth running and support the development of new features for DJ events and live performances.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* About RequestBooth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                About RequestBooth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                RequestBooth is a professional DJ song request system designed for live events, 
                parties, and performances. It provides real-time queue management, user-friendly 
                interfaces, and comprehensive controls for DJs.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">Features include:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Real-time song request queue</li>
                  <li>• Music library database</li>
                  <li>• DJ dashboard controls</li>
                  <li>• Ban management system</li>
                  <li>• Karaoke support (coming soon)</li>
                  <li>• Mobile-friendly interface</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Support Options */}
          <Card>
            <CardHeader>
              <CardTitle>Support the Project</CardTitle>
              <CardDescription>
                Your support helps maintain and improve RequestBooth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                RequestBooth is maintained independently to provide the best experience 
                for DJs and event organizers. Your donations help cover hosting costs 
                and fund new feature development.
              </p>
              
              <div className="space-y-3">
                <p className="font-semibold text-foreground">Ways to support:</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>💰 Make a donation to help with hosting and development</li>
                  <li>🎵 Share RequestBooth with other DJs and event organizers</li>
                  <li>💡 Provide feedback and feature suggestions</li>
                  <li>⭐ Tell others about your experience using RequestBooth</li>
                </ul>
              </div>

              {/* Donation Button */}
              <div className="pt-4">
                <a 
                  href="https://square.link/u/EeC7QHv8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3"
                    size="lg"
                    data-testid="button-donate"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Support RequestBooth
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Secure payment processing via Square
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thank You Section */}
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Heart className="h-8 w-8 text-red-500 mr-2" />
                <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every contribution, no matter the size, helps keep RequestBooth running smoothly 
                and enables the development of new features for the DJ community. Your support 
                is greatly appreciated!
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>for the DJ community</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}