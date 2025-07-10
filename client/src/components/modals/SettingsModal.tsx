import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Shield, ExternalLink } from "lucide-react";
import type { User as UserType } from "@/types";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserType;
}

export default function SettingsModal({ open, onOpenChange, user }: SettingsModalProps) {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Account Section */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account</span>
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4">
                <div>
                  <p className="text-slate-200 font-medium">Subscription Plan</p>
                  <p className="text-slate-400 text-sm">
                    {user?.isPremium ? 'Pro Plan - Unlimited questions' : 'Free Plan - 3 questions per day'}
                  </p>
                </div>
                <Badge variant={user?.isPremium ? "default" : "secondary"} 
                       className={user?.isPremium ? "bg-indigo-600" : "bg-slate-600"}>
                  {user?.isPremium ? 'PRO' : 'FREE'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4">
                <div>
                  <p className="text-slate-200 font-medium">Daily Question Usage</p>
                  <p className="text-slate-400 text-sm">
                    {user?.isPremium 
                      ? 'Unlimited questions available' 
                      : `${user?.dailyQuestionsUsed || 0}/3 questions used today`
                    }
                  </p>
                </div>
                {!user?.isPremium && (
                  <Button
                    onClick={() => setShowPayment(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4">
                <div>
                  <p className="text-slate-200 font-medium">API Integrations</p>
                  <p className="text-slate-400 text-sm">Manage your connected services</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Perplexity
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Claude
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Privacy Section */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Legal</span>
            </h4>
            <div className="space-y-3">
              <a 
                href="/privacy" 
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors"
              >
                <span className="text-slate-300">Privacy Policy</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              
              <a 
                href="/terms" 
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors"
              >
                <span className="text-slate-300">Terms of Service</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              
              <a 
                href="/gdpr" 
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors"
              >
                <span className="text-slate-300">GDPR Data Rights</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              
              <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                <span className="text-slate-300">Cookie Settings</span>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  Manage
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Support Section */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Support</h4>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <i className="fab fa-whatsapp text-green-400 text-lg"></i>
                <span className="text-slate-200 font-medium">WhatsApp Support</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Get instant help from our support team via WhatsApp
              </p>
              <a 
                href="https://wa.me/31628073996" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <span>+31 628 073 996</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Founder Information */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">About ContentScale</h4>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">
                <strong>Founded by Ottmar Joseph Gregory Francisca</strong>
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                ContentScale is powered by Sofeia AI, an autonomous AI agent specialized in content writing, 
                SEO optimization, and competitive analysis. Our mission is to democratize high-quality 
                content creation through advanced AI technology.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
