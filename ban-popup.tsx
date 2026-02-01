import { AlertTriangle, Shield, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import djLogo from "@assets/1000001580.png";

interface BanPopupProps {
  isOpen: boolean;
  banReason?: string;
  banTimestamp?: string;
  isPermanent?: boolean;
  expiresAt?: string;
}

export default function BanPopup({ 
  isOpen, 
  banReason, 
  banTimestamp, 
  isPermanent = true,
  expiresAt 
}: BanPopupProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Account Access Restricted</DialogTitle>
        </DialogHeader>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {/* Header with logo and icon */}
              <div className="flex items-center justify-center space-x-3 mb-4">
                <img 
                  src={djLogo} 
                  alt="RequestBooth Logo" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>

              {/* Main message */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-red-800">Account Access Restricted</h2>
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    {isPermanent ? 'Permanent Ban' : 'Temporary Ban'}
                  </span>
                </div>
              </div>

              {/* Ban details */}
              <div className="bg-white border border-red-200 p-4 rounded-lg space-y-3">
                <p className="text-sm text-red-800 font-medium">
                  Your access to RequestBooth has been restricted due to violations of our Terms of Service.
                </p>
                
                {banReason && (
                  <div className="text-left">
                    <p className="text-xs font-medium text-red-700 mb-1">Reason:</p>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">{banReason}</p>
                  </div>
                )}

                {banTimestamp && (
                  <div className="text-left">
                    <p className="text-xs font-medium text-red-700 mb-1">Date Issued:</p>
                    <p className="text-sm text-red-600">{formatDate(banTimestamp)}</p>
                  </div>
                )}

                {!isPermanent && expiresAt && (
                  <div className="text-left">
                    <p className="text-xs font-medium text-red-700 mb-1">Expires:</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-red-600" />
                      <p className="text-sm text-red-600">{formatDate(expiresAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact information */}
              <div className="bg-gray-50 border p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  If you believe this restriction was issued in error, please contact support for review and appeal.
                </p>
              </div>

              {/* Footer branding */}
              <div className="pt-3 border-t border-red-200">
                <p className="text-xs text-gray-500">© 2025 RequestBooth. All rights reserved.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}