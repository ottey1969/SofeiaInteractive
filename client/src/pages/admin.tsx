import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, CreditCard, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isPremium: boolean;
  isAdmin?: boolean;
  dailyQuestionsUsed: number;
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [credits, setCredits] = useState<number>(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/demo-users');
      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const grantCredits = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/demo-grant-credits/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Granted ${credits} credits to user`,
        });
        fetchUsers(); // Refresh user list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grant credits",
        variant: "destructive",
      });
    }
  };

  const resetUserQuestions = async (userId: string) => {
    try {
      await grantCredits(userId);
      toast({
        title: "Success",
        description: "User questions reset successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset user questions",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400">Sofeia AI - User Management</p>
            </div>
          </div>
          
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-200 text-sm">
              <strong>Admin Access:</strong> ottmar.francisca1969@gmail.com has unlimited credits and full admin privileges.
              This is a demo admin panel for testing user management features.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <p className="text-xs text-slate-400">Registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Premium Users</CardTitle>
              <Crown className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.isPremium).length}
              </div>
              <p className="text-xs text-slate-400">Active premium subscriptions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.isAdmin).length}
              </div>
              <p className="text-xs text-slate-400">System administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-white font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email || user.id
                          }
                        </p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        {user.isPremium && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Premium
                          </Badge>
                        )}
                        {user.isAdmin && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Questions used: {user.dailyQuestionsUsed}/3 daily
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetUserQuestions(user.id)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Reset Questions
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => grantCredits(user.id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Grant Credits
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Credits to grant"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white w-32"
              />
              <Button
                onClick={() => {
                  users.forEach(user => grantCredits(user.id));
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Grant Credits to All Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}