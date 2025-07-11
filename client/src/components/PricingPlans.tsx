import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
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
    period: "forever",
    description: "Perfect for trying out Sofeia AI",
    features: [
      { name: "3 questions per day", included: true },
      { name: "Basic SEO insights", included: true },
      { name: "Simple keyword research", included: true },
      { name: "Email support", included: true },
      { name: "Advanced competitor analysis", included: false },
      { name: "Unlimited questions", included: false },
      { name: "Priority support", included: false },
      { name: "Custom integrations", included: false }
    ],
    buttonText: "Get Started Free"
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    description: "For content creators and marketers",
    features: [
      { name: "150 questions per day", included: true },
      { name: "Advanced AI analysis", included: true },
      { name: "Bulk content generation", included: true },
      { name: "Comprehensive keyword research", included: true },
      { name: "Competitor analysis", included: true },
      { name: "Content strategy planning", included: true },
      { name: "Priority email support", included: true },
      { name: "Export reports", included: true }
    ],
    buttonText: "Start Pro Trial",
    popular: true
  },
  {
    name: "Agency",
    price: "$99",
    period: "month",
    description: "For agencies and teams",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Unlimited questions", included: true },
      { name: "Bulk content generation", included: true },
      { name: "Team collaboration", included: true },
      { name: "White-label reports", included: true },
      { name: "API access", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Phone support", included: true }
    ],
    buttonText: "Contact Sales"
  }
];

interface PricingPlansProps {
  onPlanSelect?: (plan: string) => void;
}

export default function PricingPlans({ onPlanSelect }: PricingPlansProps) {
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
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our core AI features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-300">/{plan.period}</span>
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
        </div>
      </div>
    </div>
  );
}