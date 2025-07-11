import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PayPalButton from "@/components/PayPalButton";
import { CheckCircle } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const features = [
    "150 questions per month",
    "Bulk content generation",
    "Advanced SEO analysis",
    "Keyword research & competitor analysis",
    "Content strategy planning",
    "Priority support access",
    "Export to multiple formats"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              $35<span className="text-lg text-slate-400">/month</span>
            </div>
            <Badge className="bg-indigo-600 text-white">
              Pro Plan - 150 Questions/Month + Bulk Features
            </Badge>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Pro Plan Includes:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <PayPalButton 
                amount="29.00"
                currency="USD"
                intent="CAPTURE"
              />
            </div>
            
            <p className="text-slate-400 text-xs text-center">
              Secure payment processing with PayPal. Cancel anytime. No hidden fees.
            </p>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <i className="fas fa-shield-alt text-green-400"></i>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-lock text-green-400"></i>
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
