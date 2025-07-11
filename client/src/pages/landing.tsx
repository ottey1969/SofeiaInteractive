import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, TrendingUp, Shield, Zap, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = () => {
    // Go directly to chat screen
    setLocation('/');
  };

  const handleStartWriting = () => {
    // Go directly to chat screen
    setLocation('/');
  };

  const handleDemo = () => {
    // Go directly to chat screen
    setLocation('/');
  };

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
            
            <Button 
              onClick={handleLogin}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
            </Button>
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
            <Button 
              size="lg" 
              onClick={handleStartWriting}
              className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3"
            >
              Start Writing with AI
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleDemo}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-3"
            >
              Try Demo
            </Button>
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