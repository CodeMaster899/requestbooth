import { Music, Wrench, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import djLogo from "@assets/1000001580.png";

export default function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto mb-4 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <Wrench className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">System Maintenance</CardTitle>
          <CardDescription className="text-lg">
            RequestBooth is currently undergoing scheduled maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Service Temporarily Unavailable</span>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-sm text-orange-800 leading-relaxed">
                We're performing scheduled system updates and improvements to enhance your RequestBooth experience. 
                All features including song requests are temporarily disabled during this maintenance window.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Maintenance will be completed shortly</span>
            </div>
          </div>

          <div className="pt-6 border-t">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <img 
                src={djLogo} 
                alt="RequestBooth Logo" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="font-bold text-xl">RequestBooth</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional DJ Song Request Platform
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © 2025 RequestBooth. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}