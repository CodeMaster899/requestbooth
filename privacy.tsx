import { ArrowLeft, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to RequestBooth
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">RequestBooth</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Data Protection
              </CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h2>1. Information We Collect</h2>
              <p>
                We collect minimal information necessary for the DJ song request service to function:
              </p>
              <ul>
                <li><strong>Request Information:</strong> Song titles, artists, requester names, and optional notes</li>
                <li><strong>User Identification:</strong> Anonymous user IDs and device fingerprints for ban management</li>
                <li><strong>Timestamps:</strong> When requests are submitted</li>
                <li><strong>Technical Data:</strong> Browser information for service functionality</li>
              </ul>

              <h2>2. How We Use Information</h2>
              <p>Your information is used to:</p>
              <ul>
                <li>Display song requests to the DJ</li>
                <li>Manage the request queue</li>
                <li>Enforce service rules and prevent abuse</li>
                <li>Maintain service functionality</li>
              </ul>

              <h2>3. Data Storage</h2>
              <p>
                Data is stored temporarily for the duration of the event. Request information may be retained 
                for a short period for service improvement and abuse prevention.
              </p>

              <h2>4. Data Sharing</h2>
              <p>
                We do not sell, trade, or share your personal information with third parties. 
                Information is only visible to:
              </p>
              <ul>
                <li>The DJ managing the event</li>
                <li>Other users (only song titles, artists, and requester names in the public queue)</li>
              </ul>

              <h2>5. User Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Request deletion of your data</li>
                <li>Withdraw consent by stopping use of the service</li>
                <li>Contact us about data concerns</li>
              </ul>

              <h2>6. Security</h2>
              <p>
                We implement reasonable security measures to protect your information from 
                unauthorized access, alteration, or destruction.
              </p>

              <h2>7. Cookies and Local Storage</h2>
              <p>
                We use browser local storage to:
              </p>
              <ul>
                <li>Remember your user preferences</li>
                <li>Store acceptance of terms of service</li>
                <li>Generate anonymous user identification</li>
              </ul>

              <h2>8. Children's Privacy</h2>
              <p>
                This service is not intended for children under 13. We do not knowingly collect 
                personal information from children under 13.
              </p>

              <h2>9. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. Changes will be posted 
                on this page with an updated date.
              </p>

              <h2>10. Contact Information</h2>
              <p>
                For privacy-related questions or concerns, please contact the event organizer or DJ.
              </p>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> This is a temporary service for live events. 
                  Data retention is minimal and focused on service functionality.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}