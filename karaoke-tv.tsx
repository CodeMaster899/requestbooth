import { useQuery } from "@tanstack/react-query";
import { type SystemStatus } from "@shared/schema";
import QRCodeDisplay from "@/components/qr-code-display";

export default function KaraokeTV() {
  // Check system status for karaoke enabled flag
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
  });

  const karaokeEnabled = systemStatus?.karaokeEnabled || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header with animated glow */}
      <div className="relative bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              🎤 Karaoke TV 🎤
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              Live Karaoke Queue Display
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {!karaokeEnabled ? (
          // Under Development Banner with Animated Singer
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl mb-8 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 text-2xl md:text-3xl font-bold">
                <span className="animate-bounce">🚧</span>
                <span>UNDER DEVELOPMENT</span>
                <span className="animate-bounce">🚧</span>
              </div>
              <p className="text-lg mt-2">
                Karaoke feature is coming soon!
              </p>
            </div>
            
            {/* Animated Singer Display */}
            <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-12 mb-8 overflow-hidden border-4 border-purple-500/30">
              {/* Background Music Notes Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 text-4xl text-purple-300 opacity-70 animate-pulse">♪</div>
                <div className="absolute top-20 right-20 text-3xl text-pink-300 opacity-60 animate-bounce delay-100">♫</div>
                <div className="absolute bottom-20 left-20 text-5xl text-blue-300 opacity-50 animate-pulse delay-200">♬</div>
                <div className="absolute bottom-10 right-10 text-3xl text-yellow-300 opacity-60 animate-bounce delay-300">♪</div>
                <div className="absolute top-1/2 left-1/4 text-4xl text-green-300 opacity-40 animate-pulse delay-500">♫</div>
                <div className="absolute top-1/3 right-1/3 text-3xl text-red-300 opacity-50 animate-bounce delay-700">♬</div>
              </div>
              
              {/* Main Animated Singer */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-8xl mb-6 animate-bounce" style={{animationDuration: '1.5s'}}>
                  🎤
                </div>
                <div className="text-9xl mb-4 relative">
                  <span className="animate-pulse" style={{animationDuration: '2s'}}>🎵</span>
                  <span className="absolute -top-4 -right-4 text-6xl animate-ping text-yellow-400">✨</span>
                  <span className="absolute -bottom-4 -left-4 text-6xl animate-ping text-pink-400 delay-500">✨</span>
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                    🎶 Get Ready to Sing! 🎶
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-2xl">
                    <span className="animate-pulse delay-100">🎵</span>
                    <span className="text-white">Karaoke System Loading...</span>
                    <span className="animate-pulse delay-300">🎵</span>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="mt-6 w-64 mx-auto bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">Preparing the stage for amazing performances...</p>
                </div>
                
                {/* Spotlight Effect */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-radial from-yellow-200/30 to-transparent rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">
                What's Coming to Karaoke TV?
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <h3 className="font-semibold text-lg">Live Queue Display</h3>
                    <p className="text-gray-300">Real-time karaoke request queue with upcoming singers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <h3 className="font-semibold text-lg">Now Playing</h3>
                    <p className="text-gray-300">Highlight the current performer and song</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-semibold text-lg">QR Code Integration</h3>
                    <p className="text-gray-300">Easy request submission via mobile devices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-semibold text-lg">Visual Effects</h3>
                    <p className="text-gray-300">Animated backgrounds and colorful displays</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code for Karaoke Requests */}
            <div className="mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-center">
                  📱 Submit Karaoke Requests
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Scan this QR code to submit your karaoke song requests
                </p>
                <QRCodeDisplay 
                  mode="karaoke" 
                  size={250}
                  showControls={false}
                  className="bg-transparent border-none shadow-none"
                  data-testid="karaoke-tv-qr-code"
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="text-gray-400 text-lg">
                Check back soon or contact your DJ for updates!
              </p>
            </div>
          </div>
        ) : (
          // Future: Live Karaoke Queue Display
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6">
                🎤 Live Karaoke Queue
              </h2>
              <p className="text-gray-300 text-lg">
                Karaoke queue display will appear here when enabled.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-sm text-gray-400">
            Powered by RequestBooth
          </p>
        </div>
      </div>
    </div>
  );
}