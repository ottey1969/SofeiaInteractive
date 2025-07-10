import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Database, UserCheck } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
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
                <Shield className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Privacy Policy</h1>
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
                <Shield className="w-6 h-6 text-indigo-400" />
                <span>Your Privacy Matters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                At ContentScale, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
                content writing platform powered by Sofeia AI.
              </p>
              <p>
                Founded by Ottmar Joseph Gregory Francisca, ContentScale operates under strict GDPR compliance and data protection standards.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <Database className="w-6 h-6 text-blue-400" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-300">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Personal Information</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Account information (email, name, profile picture) via Replit authentication</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Payment information processed securely through PayPal</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Communication data when you contact our WhatsApp support (+31 628 073 996)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Usage Information</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Content queries and AI-generated responses</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Daily usage statistics and question counts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>AI activity logs for performance optimization</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Technical Information</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>IP address, browser type, and device information</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Session data and authentication tokens</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Performance metrics and error logs</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <Eye className="w-6 h-6 text-emerald-400" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Service Provision</h4>
                  <ul className="space-y-2">
                    <li>• Generate AI-powered content responses</li>
                    <li>• Perform keyword research via Perplexity API</li>
                    <li>• Analyze content using Anthropic Claude</li>
                    <li>• Manage user accounts and subscriptions</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Platform Improvement</h4>
                  <ul className="space-y-2">
                    <li>• Optimize AI response quality</li>
                    <li>• Enhance user experience</li>
                    <li>• Monitor system performance</li>
                    <li>• Develop new features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing and Third Parties */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Data Sharing and Third Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>We share your information only in the following circumstances:</p>
              
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">AI Service Providers</h4>
                  <p className="text-sm">
                    <strong>Perplexity AI:</strong> For real-time research and keyword analysis<br />
                    <strong>Anthropic:</strong> For content generation and analysis using Claude AI
                  </p>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Payment Processing</h4>
                  <p className="text-sm">
                    <strong>PayPal:</strong> For secure payment processing and subscription management
                  </p>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Authentication</h4>
                  <p className="text-sm">
                    <strong>Replit:</strong> For secure user authentication and account management
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights Under GDPR */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-400" />
                <span>Your Rights Under GDPR</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>As a user, you have the following rights regarding your personal data:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white font-medium">Right of Access</h5>
                      <p className="text-sm">Request copies of your personal data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white font-medium">Right of Rectification</h5>
                      <p className="text-sm">Request correction of inaccurate data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white font-medium">Right of Erasure</h5>
                      <p className="text-sm">Request deletion of your data</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white font-medium">Right of Portability</h5>
                      <p className="text-sm">Request transfer of your data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white font-medium">Right to Object</h5>
                      <p className="text-sm">Object to processing of your data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white font-medium">Right to Restrict</h5>
                      <p className="text-sm">Request restriction of processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>If you have any questions about this Privacy Policy or wish to exercise your GDPR rights, please contact us:</p>
              
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div>
                  <strong className="text-white">Data Controller:</strong><br />
                  Ottmar Joseph Gregory Francisca<br />
                  Founder, ContentScale
                </div>
                
                <div>
                  <strong className="text-white">WhatsApp Support:</strong><br />
                  <a href="https://wa.me/31628073996" target="_blank" rel="noopener noreferrer" 
                     className="text-green-400 hover:text-green-300 transition-colors">
                    +31 628 073 996
                  </a>
                </div>
                
                <div>
                  <strong className="text-white">GDPR Requests:</strong><br />
                  <Link href="/gdpr">
                    <Button variant="outline" size="sm" className="mt-2">
                      Submit GDPR Request
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
