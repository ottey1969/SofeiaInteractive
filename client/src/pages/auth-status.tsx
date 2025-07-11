import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Users, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthStatus() {
  const [, setLocation] = useLocation();
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Test authentication endpoint
      const authResponse = await fetch('/api/login');
      
      // Test admin endpoints
      const adminResponse = await fetch('/api/admin/demo-users');
      const adminData = await adminResponse.json();
      
      setAuthStatus({
        authWorking: authResponse.status === 302, // Redirect means auth is configured
        adminWorking: adminResponse.ok,
        userCount: adminData.count || 0,
        demoMode: true
      });
    } catch (error) {
      setAuthStatus({
        authWorking: false,
        adminWorking: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Checking system status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Sofeia AI - System Status</h1>
              <p className="text-slate-400">Authentication & Admin System Status</p>
            </div>
            <Button onClick={() => setLocation('/')} variant="outline" className="border-slate-600 text-slate-300">
              ← Back to Home
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Authentication Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                {authStatus?.authWorking ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span>User Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Replit OAuth</span>
                <Badge className={authStatus?.authWorking ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {authStatus?.authWorking ? "Configured" : "Needs Fix"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Demo Mode</span>
                <Badge className="bg-blue-500/20 text-blue-400">
                  Available
                </Badge>
              </div>
              
              <div className="text-sm text-slate-400">
                {authStatus?.authWorking ? (
                  "✅ Subscribers can login with their Replit accounts"
                ) : (
                  "⚠️ Authentication needs configuration - Demo mode available"
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin System Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                {authStatus?.adminWorking ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span>Admin System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Admin Panel</span>
                <Badge className="bg-green-500/20 text-green-400">
                  Working
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">User Management</span>
                <Badge className="bg-green-500/20 text-green-400">
                  Available
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Registered Users</span>
                <Badge className="bg-slate-600 text-slate-300">
                  {authStatus?.userCount || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Solutions */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span>Available Access Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Access */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-400">Demo Mode (No Login Required)</h3>
                <Badge className="bg-blue-500/20 text-blue-400">Available Now</Badge>
              </div>
              <p className="text-slate-300 mb-4">
                Full access to Sofeia AI chat interface with real-time AI responses and thinking visualization.
                Perfect for testing the system capabilities.
              </p>
              <Button 
                onClick={() => setLocation('/')} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Demo Mode
              </Button>
            </div>

            {/* Admin Access */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-purple-400">Admin Panel</h3>
                <Badge className="bg-purple-500/20 text-purple-400">Available Now</Badge>
              </div>
              <p className="text-slate-300 mb-4">
                Full user management, credit allocation, and subscription control. 
                Direct access without authentication for testing purposes.
              </p>
              <Button 
                onClick={() => setLocation('/admin')} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                Open Admin Panel
              </Button>
            </div>

            {/* Real Authentication */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-green-400">Subscriber Authentication</h3>
                <Badge className="bg-green-500/20 text-green-400">Ready When Fixed</Badge>
              </div>
              <p className="text-slate-300 mb-4">
                Real Replit OAuth authentication for subscribers. When working, ottmar.francisca1969@gmail.com 
                will automatically receive unlimited credits and admin privileges.
              </p>
              <div className="text-sm text-slate-400">
                <strong>Admin Email:</strong> ottmar.francisca1969@gmail.com
                <br />
                <strong>Benefits:</strong> Unlimited questions, full admin access, user management
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setLocation('/')} 
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Test Chat Interface
          </Button>
          
          <Button 
            onClick={() => setLocation('/admin')} 
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
          
          <Button 
            onClick={checkAuthStatus} 
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}