import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  mode: "dj" | "karaoke";
  size?: number;
  showControls?: boolean;
  className?: string;
}

export default function QRCodeDisplay({ 
  mode, 
  size = 200, 
  showControls = true,
  className = "" 
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Generate the URL for the guest request page with mode parameter
  const targetUrl = `${window.location.origin}/?mode=${mode}`;

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
          width: size,
          margin: 2,
          color: {
            dark: "#1F2937", // Dark gray for dark mode compatibility
            light: "#FFFFFF", // White background
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
        toast({
          title: "Error",
          description: "Failed to generate QR code",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [targetUrl, size, toast]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      toast({
        title: "Success",
        description: "URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `requestbooth-${mode}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded",
    });
  };

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-[200px] h-[200px] bg-muted rounded-lg">
              <QrCode className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* QR Code Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              {mode === "dj" ? "DJ Request QR Code" : "Karaoke Request QR Code"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Scan to open {mode === "dj" ? "DJ" : "Karaoke"} request page
            </p>
          </div>

          {/* QR Code Image */}
          <div className="bg-white p-4 rounded-lg border-2 border-border">
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${mode} requests`}
              className="block"
              data-testid={`qr-code-${mode}`}
            />
          </div>

          {/* URL Display */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground break-all">
              {targetUrl}
            </p>
          </div>

          {/* Control Buttons */}
          {showControls && (
            <div className="flex space-x-2">
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                data-testid={`button-copy-url-${mode}`}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                size="sm"
                data-testid={`button-download-qr-${mode}`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}