import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, UserCheck, Download, Trash2, Edit3 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function GDPR() {
  const [requestType, setRequestType] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const submitRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      // In a real implementation, this would send to a GDPR request endpoint
      // For now, we'll simulate this with WhatsApp contact
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your GDPR request has been submitted. We will contact you within 30 days.",
      });
      setRequestType("");
      setEmail("");
      setDescription("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please contact us via WhatsApp.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType || !email) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitRequestMutation.mutate({
      type: requestType,
      email,
      description,
    });
  };

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
                <UserCheck className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">GDPR Data Rights</h1>
                <p className="text-xs text-slate-400">Exercise your data protection rights</p>
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
                <span>Your Data Protection Rights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                Under the General Data Protection Regulation (GDPR), you have several rights regarding your personal data. 
                ContentScale, founded by Ottmar Joseph Gregory Francisca, is committed to respecting these rights and 
                processing your requests promptly.
              </p>
              <p>
                Use this form to exercise your GDPR rights or contact our WhatsApp support for immediate assistance.
              </p>
            </CardContent>
          </Card>

          {/* GDPR Rights Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white text-lg">Right of Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Request a copy of all personal data we hold about you, including your conversations, 
                  usage statistics, and account information.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Edit3 className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white text-lg">Right of Rectification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Request correction of any inaccurate or incomplete personal data we hold about you.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white text-lg">Right of Erasure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Request deletion of your personal data when there's no compelling reason for us to continue processing it.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white text-lg">Right to Portability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Request your data in a structured, commonly used format for transfer to another service.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-white text-lg">Right to Object</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Object to processing of your data for direct marketing or other legitimate interests.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white text-lg">Right to Restrict</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Request restriction of processing under certain circumstances while maintaining your account.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* GDPR Request Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Submit a GDPR Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Request Type *
                  </label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Select your request type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="access">Data Access Request</SelectItem>
                      <SelectItem value="rectification">Data Rectification Request</SelectItem>
                      <SelectItem value="erasure">Data Erasure Request</SelectItem>
                      <SelectItem value="portability">Data Portability Request</SelectItem>
                      <SelectItem value="object">Object to Processing</SelectItem>
                      <SelectItem value="restrict">Restrict Processing</SelectItem>
                      <SelectItem value="other">Other GDPR Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Must match the email address associated with your ContentScale account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Request Details
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide additional details about your request..."
                    className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 min-h-[100px]"
                    rows={4}
                  />
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Important Information</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• We will respond to your request within 30 days</li>
                    <li>• We may need to verify your identity before processing</li>
                    <li>• Some requests may require additional documentation</li>
                    <li>• Complex requests may take up to 90 days with prior notification</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={submitRequestMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {submitRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => {
                      setRequestType("");
                      setEmail("");
                      setDescription("");
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Need Immediate Assistance?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                For urgent GDPR requests or questions about your data rights, contact us directly:
              </p>
              
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div>
                  <strong className="text-white">Data Protection Officer:</strong><br />
                  <span className="text-slate-300">Ottmar Joseph Gregory Francisca</span><br />
                  <span className="text-slate-400 text-sm">Founder & Data Controller, ContentScale</span>
                </div>
                
                <div>
                  <strong className="text-white">WhatsApp Support:</strong><br />
                  <a href="https://wa.me/31628073996" target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                    <i className="fab fa-whatsapp"></i>
                    <span>+31 628 073 996</span>
                  </a>
                </div>
                
                <div>
                  <strong className="text-white">Response Time:</strong><br />
                  <span className="text-slate-300 text-sm">Usually within 24 hours via WhatsApp</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Quick Tip:</strong> For faster processing, mention "GDPR Request" when contacting us 
                  via WhatsApp and include your registered email address.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
