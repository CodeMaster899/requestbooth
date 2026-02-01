import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function TermsOfService() {
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
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Terms of Service</h1>
                <p className="text-muted-foreground">RequestBooth</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Service Agreement
              </CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By using this DJ Song Request System, you agree to comply with and be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use this service.
              </p>

              <h2>2. Service Description</h2>
              <p>
                This system allows users to submit song requests to a DJ during live events. The DJ has full discretion 
                over which requests to accept, reject, or modify.
              </p>

              <h2>3. User Conduct</h2>
              <p>Users must not:</p>
              <ul>
                <li>Make trolling or spam requests</li>
                <li>Use offensive language in requester names or notes</li>
                <li>Attempt to disrupt the service or other users' experience</li>
                <li>Submit duplicate requests excessively</li>
                <li>Submit inappropriate requests that violate event-specific guidelines</li>
              </ul>

              <h2>4. Content Guidelines</h2>
              <p>
                All song requests must be appropriate for the event context. Explicit songs are generally allowed, 
                but restrictions may apply for family-friendly or children's events based on client preferences. 
                The DJ and event organizer have final discretion on content appropriateness.
              </p>
              <p>
                Requests containing hate speech, discriminatory content, or material that violates event-specific 
                guidelines will be removed.
              </p>

              <h2>5. Enforcement</h2>
              <p>
                Violations of these terms may result in:
              </p>
              <ul>
                <li>Request removal</li>
                <li>Temporary restrictions</li>
                <li>Permanent ban from the service</li>
              </ul>

              <h2>6. Privacy</h2>
              <p>
                We collect minimal information necessary for the service to function. 
                See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                This service is provided "as is" without warranties. We are not liable for any damages 
                arising from use of this service.
              </p>

              <h2>8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service 
                constitutes acceptance of any changes.
              </p>

              <h2>9. Contact</h2>
              <p>
                For questions about these terms, please contact the event organizer or DJ.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}