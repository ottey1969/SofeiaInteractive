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
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (email = '', limit = 50, offset = 0) => {
    try {
      const params = new URLSearchParams({ 
        limit: limit.toString(), 
        offset: offset.toString() 
      });
      if (email) params.append('email', email);
      
      const response = await fetch(`/api/admin/demo-users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
      setSearchResults(data);
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

  const searchUserByEmail = async (email: string) => {
    if (!email.trim()) {
      fetchUsers();
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/demo-user-by-email/${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers([data.user]);
        setSearchResults({ count: 1, total: totalUsers, users: [data.user] });
        toast({
          title: "User Found",
          description: `Found user: ${data.user.email}`,
        });
      } else {
        setUsers([]);
        setSearchResults({ count: 0, total: totalUsers, users: [] });
        toast({
          title: "No Results",
          description: "No user found with that email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search user",
        variant: "destructive",
      });
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

  const createTestUsers = async () => {
    try {
      const response = await fetch('/api/admin/demo-create-test-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Created ${data.users.length} test users including admin and premium subscribers`,
        });
        fetchUsers(); // Refresh user list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test users",
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalUsers}</div>
              <p className="text-xs text-slate-400">All registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Showing</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <p className="text-xs text-slate-400">Currently displayed</p>
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
              <p className="text-xs text-slate-400">Premium subscribers</p>
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

        {/* Search and Filter */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white flex-1"
              />
              <Button
                onClick={() => searchUserByEmail(searchEmail)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Search
              </Button>
              <Button
                onClick={() => {
                  setSearchEmail('');
                  fetchUsers();
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Show All
              </Button>
            </div>
            {searchResults && (
              <div className="mt-4 text-sm text-slate-400">
                {searchEmail ? 
                  `Search results: ${searchResults.count} user(s) found` :
                  `Showing ${searchResults.count} of ${searchResults.total} total users`
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">All Subscribers & Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No users found</p>
                {searchEmail && (
                  <Button 
                    onClick={() => {
                      setSearchEmail('');
                      fetchUsers();
                    }}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Show All Users
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* User Info */}
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : 'User'
                              }
                            </h3>
                            <p className="text-indigo-400 font-mono text-sm">{user.email || 'No email'}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {user.isPremium && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Premium Subscriber
                            </Badge>
                          )}
                          {user.isAdmin && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Admin Access
                            </Badge>
                          )}
                          {!user.isPremium && !user.isAdmin && (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Free User
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-slate-400 space-y-1">
                          <p><strong>User ID:</strong> {user.id}</p>
                          <p><strong>Daily Questions:</strong> {user.dailyQuestionsUsed || 0}/3 used</p>
                          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUserQuestions(user.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Reset Daily Questions
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => grantCredits(user.id)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Grant {credits} Credits
                        </Button>
                        {user.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSearchEmail(user.email!);
                              searchUserByEmail(user.email!);
                            }}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Search This Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Test Data */}
              {totalUsers === 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="text-blue-400 font-semibold mb-2">No Users Found</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    Create test users to see how the admin panel works with subscriber management.
                  </p>
                  <Button
                    onClick={createTestUsers}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Test Users
                  </Button>
                </div>
              )}
              
              {/* Bulk Credits */}
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
                  disabled={users.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  Grant {credits} Credits to All Users
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}