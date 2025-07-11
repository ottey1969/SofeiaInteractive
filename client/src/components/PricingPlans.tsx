import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PricingPlan {
  name: string;
  price: string;
  priceAnnual: string;
  period: string;
  description: string;
  roiMessage: string;
  features: Array<{
    name: string;
    included: boolean;
  }>;
  buttonText: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    priceAnnual: "$0",
    period: "forever",
    description: "Start your content scaling journey risk-free",
    roiMessage: "Test AI-powered content creation with zero risk",
    features: [
      { name: "3 questions per month", included: true },
      { name: "Basic SEO insights", included: true },
      { name: "Simple keyword research", included: true },
      { name: "Email support", included: true },
      { name: "Advanced competitor analysis", included: false },
      { name: "Bulk content generation", included: false },
      { name: "Overage questions ($0.25 each)", included: false },
      { name: "Priority support", included: false }
    ],
    buttonText: "Start Free - No Credit Card"
  },
  {
    name: "Pro",
    price: "$35",
    priceAnnual: "$28",
    period: "month",
    description: "10x your content output with AI-powered efficiency",
    roiMessage: "Save 15+ hours/week on content creation - ROI in first month",
    features: [
      { name: "150 questions per month", included: true },
      { name: "Overage questions ($0.25 each)", included: true },
      { name: "Bulk content generation", included: true },
      { name: "Advanced SEO analysis", included: true },
      { name: "Comprehensive keyword research", included: true },
      { name: "Competitor analysis", included: true },
      { name: "Content strategy planning", included: true },
      { name: "Priority email support", included: true }
    ],
    buttonText: "Start Pro Trial",
    popular: true
  },
  {
    name: "Agency",
    price: "$99",
    priceAnnual: "$79",
    period: "month",
    description: "Scale your agency with enterprise-grade AI tools",
    roiMessage: "Increase client capacity by 300% - $50K+ additional revenue/year",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "500 questions per month", included: true },
      { name: "Overage questions ($0.25 each)", included: true },
      { name: "Team collaboration", included: true },
      { name: "White-label reports", included: true },
      { name: "API access", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated account manager", included: true }
    ],
    buttonText: "Contact Sales"
  },
  {
    name: "Premium Agency",
    price: "$249",
    priceAnnual: "$199",
    period: "month",
    description: "Maximum ROI for high-volume content operations",
    roiMessage: "Handle 1000+ clients efficiently - $200K+ revenue increase potential",
    features: [
      { name: "Everything in Agency", included: true },
      { name: "1500 questions per month", included: true },
      { name: "Overage questions ($0.25 each)", included: true },
      { name: "Priority support (24/7)", included: true },
      { name: "Beta feature access", included: true },
      { name: "Advanced analytics dashboard", included: true },
      { name: "Custom AI model training", included: true },
      { name: "Enterprise integrations", included: true }
    ],
    buttonText: "Contact Sales"
  }
];

interface PricingPlansProps {
  onPlanSelect?: (plan: string) => void;
}

export default function PricingPlans({ onPlanSelect }: PricingPlansProps) {
  const [isAnnual, setIsAnnual] = React.useState(false);
  
  const handlePlanSelect = (planName: string) => {
    if (onPlanSelect) {
      onPlanSelect(planName);
    }
  };

  return (
    <div className="py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Choose Your ROI-Focused Plan
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Scale your content production and increase revenue with AI-powered efficiency.
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="mx-3 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-slate-600"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annual <span className="text-green-400 font-semibold">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative bg-slate-800 border-slate-700 ${
                plan.popular 
                  ? 'ring-2 ring-indigo-500 transform scale-105' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-slate-300">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {isAnnual ? plan.priceAnnual : plan.price}
                  </span>
                  <span className="text-slate-300">/{plan.period}</span>
                  {isAnnual && plan.name !== "Free" && (
                    <div className="text-sm text-green-400 mt-1">
                      Save ${(parseFloat(plan.price.replace('$', '')) - parseFloat(plan.priceAnnual.replace('$', ''))) * 12}/year
                    </div>
                  )}
                </div>
                <div className="mt-3 p-2 bg-green-900/20 rounded-lg border border-green-500/30">
                  <p className="text-sm text-green-400 font-medium">
                    💰 {plan.roiMessage}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    )}
                    <span 
                      className={`text-sm ${
                        feature.included ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                  }`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            All plans include a 14-day free trial. No credit card required for Free plan.
          </p>
          <div className="mt-4 flex justify-center space-x-8 text-sm text-slate-400">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Secure payments</span>
          </div>
          <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-600">
            <h3 className="text-white font-semibold mb-2">💡 Overage Pricing</h3>
            <p className="text-slate-300 text-sm">
              When you exceed your monthly question limit, additional questions are billed at $0.25 each. 
              Free users cannot purchase overages and must upgrade to continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}