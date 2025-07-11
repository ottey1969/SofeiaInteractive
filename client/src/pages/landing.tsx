import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, TrendingUp, Shield, Zap, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth0 } from '@auth0/auth0-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleStartWriting = () => {
    if (isAuthenticated) {
      setLocation('/home');
    } else {
      loginWithRedirect();
    }
  };

  const handleDemo = () => {
    // Set demo mode and go to chat
    sessionStorage.setItem('demo_mode', 'true');
    setLocation('/home');
  };

  const callProtectedApi = async () => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://api.sofeia.com",
        },
      });
      console.log("Access Token:", accessToken);
      
      // Call the protected API endpoint
      const response = await fetch('/api/protected', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Authentication Success!",
          description: "You've successfully accessed the protected API. Premium features are now available.",
          variant: "default",
        });
        console.log("Protected API response:", data);
      } else {
        throw new Error('Failed to access protected API');
      }
    } catch (error) {
      console.error("Error accessing protected API:", error);
      toast({
        title: "Authentication Error",
        description: "Unable to access premium features. Please try logging in again.",
        variant: "destructive",
      });
    }
  };

  // Check if Auth0 is properly configured
  const isAuth0Configured = import.meta.env.VITE_AUTH0_DOMAIN && 
    import.meta.env.VITE_AUTH0_DOMAIN !== "dev-sofeia.us.auth0.com" &&
    import.meta.env.VITE_AUTH0_CLIENT_ID && 
    import.meta.env.VITE_AUTH0_CLIENT_ID !== "sofeia-ai-client-id";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show Auth0 setup instructions if not properly configured
  if (!isAuth0Configured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Auth0 Setup Required</h1>
          <div className="text-left bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-indigo-400 mb-4">To enable secure authentication:</h2>
            <ol className="text-slate-300 space-y-3 list-decimal list-inside">
              <li>Create an Auth0 account at <span className="text-indigo-400">auth0.com</span></li>
              <li>Create a new "Single Page Web Application"</li>
              <li>Set your <strong>Allowed Callback URLs</strong> to: <code className="bg-slate-700 px-2 py-1 rounded">{window.location.origin}</code></li>
              <li>Set your <strong>Allowed Logout URLs</strong> to: <code className="bg-slate-700 px-2 py-1 rounded">{window.location.origin}</code></li>
              <li>Set your <strong>Allowed Web Origins</strong> to: <code className="bg-slate-700 px-2 py-1 rounded">{window.location.origin}</code></li>
              <li>Copy your <strong>Domain</strong> and <strong>Client ID</strong> from the Auth0 dashboard</li>
              <li>Update the environment variables in <code className="bg-slate-700 px-2 py-1 rounded">.env</code> file</li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleDemo}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Continue with Demo Mode
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://auth0.com', '_blank')}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Set Up Auth0
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ContentScale</h1>
                <p className="text-xs text-slate-400">Powered by Sofeia AI</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <>
                  <Button 
                    onClick={handleLogin}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Login / Sign Up
                  </Button>
                  <Button 
                    onClick={handleDemo}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Try Demo
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>Welcome, {user?.name}!</span>
                  </div>
                  <Button 
                    onClick={() => setLocation('/home')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Go to Chat
                  </Button>
                  <Button 
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            Advanced AI Content Platform
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Meet Sofeia AI
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-slate-300">
            Your Autonomous Content Writing Assistant
          </h2>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Experience real-time AI thinking with advanced content generation, 
            SEO optimization, and competitive analysis powered by cutting-edge AI technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  onClick={handleStartWriting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3"
                >
                  Login to Start Writing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleDemo}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-3"
                >
                  Try Demo (No Login)
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => setLocation('/home')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3"
                >
                  Start Writing Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={callProtectedApi}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-3"
                >
                  Access Premium Features
                </Button>
              </>
            )}
          </div>
          
          <div className="text-center mb-8">
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              <p className="text-sm text-slate-500">
                <strong>For Subscribers:</strong> Real login is now available! Admin users get unlimited access.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  onClick={() => setLocation('/admin')}
                  className="text-indigo-400 hover:text-indigo-300 text-sm p-0 h-auto"
                >
                  → Admin Panel
                </Button>
                <Button
                  variant="link"
                  onClick={() => setLocation('/status')}
                  className="text-green-400 hover:text-green-300 text-sm p-0 h-auto"
                >
                  → System Status
                </Button>
              </div>
            </div>
          </div>

          {/* AI Thinking Visualization */}
          <div className="relative max-w-2xl mx-auto bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Sofeia AI is thinking...</h3>
              <div className="flex space-x-1 ml-auto">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Researching top competitors...</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Analyzing keyword opportunities...</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                <span className="text-slate-400">Crafting SEO strategy...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Why Choose Sofeia AI?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Advanced AI capabilities that transform how you create and optimize content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Real-time Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Watch Sofeia AI research competitors, analyze SERPs, and find keyword opportunities in real-time with Perplexity integration.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">AI Brain Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Unique real-time visualization of AI thinking process - see exactly how Sofeia analyzes and strategizes your content.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-white">SEO Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                C.R.A.F.T framework implementation with Google AI Overview optimization for maximum search visibility.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">Instant Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Generate high-quality, SEO-optimized content instantly with Claude-4 Sonnet integration and advanced prompting.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Deep competitive intelligence with gap analysis and actionable recommendations to outrank competitors.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">GDPR Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Fully GDPR compliant with transparent data handling and user privacy protection built-in from day one.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start free with 3 questions per day, upgrade for unlimited access
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Free Plan</CardTitle>
              <div className="text-3xl font-bold text-slate-300 mt-4">$0<span className="text-lg text-slate-400">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">3 questions per day</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Basic AI responses</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Real-time AI visualization</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">WhatsApp support</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Pro Plan</CardTitle>
              <div className="text-3xl font-bold text-white mt-4">$29<span className="text-lg text-slate-400">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Unlimited questions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Advanced AI analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Priority processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Export capabilities</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Advanced SEO tools</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={handleStartWriting}
            className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">ContentScale</h3>
                  <p className="text-xs text-slate-400">Powered by Sofeia AI</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Founded by Ottmar Joseph Gregory Francisca. Advanced AI content platform for the modern digital age.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Features</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Pricing</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">API</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Documentation</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="https://wa.me/31628073996" target="_blank" rel="noopener noreferrer" className="block text-slate-400 hover:text-indigo-400 transition-colors">WhatsApp Support</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Help Center</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Community</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Status</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="/privacy" className="block text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</a>
                <a href="/terms" className="block text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</a>
                <a href="/gdpr" className="block text-slate-400 hover:text-indigo-400 transition-colors">GDPR Compliance</a>
                <a href="#" className="block text-slate-400 hover:text-indigo-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 ContentScale AI. All rights reserved. Founded by Ottmar Joseph Gregory Francisca.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}