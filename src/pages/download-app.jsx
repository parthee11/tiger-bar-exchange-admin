import { Button } from '../components/ui/button';
import { Download } from 'lucide-react';

export function DownloadApp() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/tiger-bar-stock-exchange.apk';
    link.download = 'tiger-bar-stock-exchange.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Download Tiger Bar App</h1>
          <p className="text-gray-600">Get the latest version of our mobile app for the best experience.</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleDownload}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download APK
          </Button>

          <p className="text-sm text-gray-500">
            For Android devices only. Make sure to enable "Install from unknown sources" in your device settings.
          </p>
        </div>
      </div>
    </div>
  );
}
