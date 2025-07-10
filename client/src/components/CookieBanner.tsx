import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1 mr-4">
            <p className="text-slate-300 text-sm">
              We use cookies to enhance your experience and analyze our AI performance. 
              <a 
                href="/privacy" 
                className="text-indigo-400 hover:text-indigo-300 underline ml-1"
              >
                Learn more about our privacy practices
              </a>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={declineCookies}
              className="text-slate-400 hover:text-white"
            >
              Decline
            </Button>
            <Button
              onClick={acceptCookies}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
