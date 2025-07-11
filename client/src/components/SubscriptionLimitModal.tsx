import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Clock, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionsRemaining: number;
  resetTime?: Date;
  subscriptionType: string;
}

export default function SubscriptionLimitModal({
  isOpen,
  onClose,
  questionsRemaining,
  resetTime,
  subscriptionType
}: SubscriptionLimitModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onClose();
    setLocation('/pricing');
  };

  const formatResetTime = (date: Date) => {
    const hours = 24 - date.getHours();
    const minutes = 60 - date.getMinutes();
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-white text-xl">
                {questionsRemaining === 0 ? 'Daily Limit Reached' : 'Almost at Your Limit'}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {subscriptionType === 'free' && (
                  <>You have {questionsRemaining} questions left today</>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Questions today:</span>
              <span className="text-white font-medium">
                {subscriptionType === 'free' ? `${3 - questionsRemaining}/3` : 'Unlimited'}
              </span>
            </div>
            
            {subscriptionType === 'free' && questionsRemaining === 0 && resetTime && (
              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-600">
                <span className="text-slate-300 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Resets in:
                </span>
                <span className="text-indigo-400 font-medium">
                  {formatResetTime(resetTime)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4 border border-indigo-500/30">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-indigo-400" />
                Upgrade to Pro
              </h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Unlimited questions</li>
                <li>• Advanced SEO analysis</li>
                <li>• Competitor research</li>
                <li>• Priority support</li>
              </ul>
              <div className="mt-3">
                <span className="text-white font-bold">$29/month</span>
                <span className="text-slate-400 text-sm ml-2">• Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            {questionsRemaining > 0 ? 'Continue' : 'Wait for Reset'}
          </Button>
          <Button
            onClick={handleUpgrade}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}