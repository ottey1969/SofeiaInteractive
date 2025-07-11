import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PricingPlans from '@/components/PricingPlans';
import { useToast } from '@/hooks/use-toast';

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Free') {
      toast({
        title: "Free Plan Selected",
        description: "You can start using Sofeia AI right away with 3 questions per day.",
      });
      setLocation('/');
    } else if (planName === 'Pro') {
      toast({
        title: "Pro Plan Selected",
        description: "Redirecting to payment processor...",
      });
      // Here you would integrate with PayPal or Stripe
      setTimeout(() => {
        toast({
          title: "Demo Mode",
          description: "Payment integration will be available in production.",
          variant: "default",
        });
      }, 2000);
    } else if (planName === 'Agency') {
      toast({
        title: "Agency Plan Inquiry",
        description: "Please contact our sales team for custom pricing.",
      });
      // Here you would redirect to contact form or Calendly
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose the Perfect Plan for Your Needs
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            From individual content creators to large agencies, we have a plan that scales with your business.
          </p>
        </div>

        <PricingPlans onPlanSelect={handlePlanSelect} />

        <div className="mt-16 bg-slate-800 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            We work with enterprise clients to create custom solutions that fit your specific needs. 
            Contact our team to discuss volume pricing, custom integrations, and dedicated support.
          </p>
          <Button 
            size="lg"
            onClick={() => toast({
              title: "Contact Sales",
              description: "Enterprise sales team will be available in production.",
            })}
          >
            Contact Enterprise Sales
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              Expert Support
            </h4>
            <p className="text-slate-300 text-sm">
              Get help from our team of SEO and content experts
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              Regular Updates
            </h4>
            <p className="text-slate-300 text-sm">
              New features and improvements added monthly
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              Data Security
            </h4>
            <p className="text-slate-300 text-sm">
              Enterprise-grade security for all your content data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}