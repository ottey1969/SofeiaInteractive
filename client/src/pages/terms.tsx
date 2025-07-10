import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, CreditCard, Gavel } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to ContentScale
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Terms of Service</h1>
                <p className="text-xs text-slate-400">Last updated: January 10, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <Gavel className="w-6 h-6 text-indigo-400" />
                <span>Agreement to Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                Welcome to ContentScale, an advanced AI content writing platform powered by Sofeia AI. 
                These Terms of Service ("Terms") govern your use of our platform and services.
              </p>
              <p>
                By accessing or using ContentScale, you agree to be bound by these Terms. If you disagree 
                with any part of these terms, then you may not access our service.
              </p>
              <p>
                ContentScale is founded and operated by Ottmar Joseph Gregory Francisca, and we are committed 
                to providing you with exceptional AI-powered content creation tools.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                ContentScale provides AI-powered content writing and SEO optimization services through our 
                proprietary Sofeia AI system, which integrates with:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">AI Technologies</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Anthropic Claude for content generation</li>
                    <li>• Perplexity AI for research and analysis</li>
                    <li>• Real-time AI thinking visualization</li>
                    <li>• C.R.A.F.T framework implementation</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Keyword research and analysis</li>
                    <li>• Competitor content analysis</li>
                    <li>• Google AI Overview optimization</li>
                    <li>• SEO strategy development</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts and Responsibilities */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span>User Accounts and Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-300">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Account Registration</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You must provide accurate and complete information during registration</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You are responsible for maintaining the security of your account</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You must be at least 18 years old to use our services</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Acceptable Use</h4>
                <p>You agree not to use ContentScale for:</p>
                <ul className="space-y-2 ml-4 mt-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Creating harmful, offensive, or illegal content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Attempting to reverse engineer our AI systems</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Violating any applicable laws or regulations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Infringing on intellectual property rights</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subscription and Payment Terms */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <span>Subscription and Payment Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Free Plan</h4>
                  <ul className="space-y-2">
                    <li>• 3 questions per day</li>
                    <li>• Basic AI responses</li>
                    <li>• Real-time AI visualization</li>
                    <li>• WhatsApp support access</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Pro Plan - $29/month</h4>
                  <ul className="space-y-2">
                    <li>• Unlimited questions</li>
                    <li>• Advanced AI analysis</li>
                    <li>• Priority processing</li>
                    <li>• Export capabilities</li>
                    <li>• Premium support</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Payment Terms</h4>
                <ul className="space-y-2 text-sm">
                  <li>• All payments are processed securely through PayPal</li>
                  <li>• Subscriptions are billed monthly in advance</li>
                  <li>• You may cancel your subscription at any time</li>
                  <li>• Refunds are provided on a case-by-case basis</li>
                  <li>• Price changes will be communicated 30 days in advance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Your Content</h4>
                <p>
                  You retain ownership of any content you input into ContentScale. However, you grant us 
                  a limited license to process your content through our AI systems to provide our services.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">AI-Generated Content</h4>
                <p>
                  Content generated by Sofeia AI is provided to you under a non-exclusive license. 
                  You may use this content for your business purposes, but we retain rights to our 
                  AI technology and methodologies.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Platform Technology</h4>
                <p>
                  ContentScale, Sofeia AI, and all related technologies remain the intellectual property 
                  of Ottmar Joseph Gregory Francisca and ContentScale.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                ContentScale and its founder, Ottmar Joseph Gregory Francisca, shall not be liable for:
              </p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Any indirect, incidental, or consequential damages</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Loss of profits, data, or business opportunities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Inaccuracies in AI-generated content</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Service interruptions or technical issues</span>
                </li>
              </ul>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                <p className="text-amber-300 text-sm">
                  <strong>Important:</strong> AI-generated content should be reviewed and verified before use. 
                  While Sofeia AI strives for accuracy, users are responsible for fact-checking and ensuring 
                  content meets their specific requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div>
                  <strong className="text-white">Service Provider:</strong><br />
                  Ottmar Joseph Gregory Francisca<br />
                  Founder, ContentScale
                </div>
                
                <div>
                  <strong className="text-white">Support:</strong><br />
                  <a href="https://wa.me/31628073996" target="_blank" rel="noopener noreferrer" 
                     className="text-green-400 hover:text-green-300 transition-colors">
                    WhatsApp: +31 628 073 996
                  </a>
                </div>
                
                <div>
                  <strong className="text-white">Legal Inquiries:</strong><br />
                  Contact us via WhatsApp for legal matters and compliance questions.
                </div>
              </div>

              <div className="text-center pt-6">
                <p className="text-sm text-slate-400">
                  By using ContentScale, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
