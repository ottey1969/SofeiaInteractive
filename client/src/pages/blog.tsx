import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Search, TrendingUp, FileText, Image, Copy, Download, Share2, Zap, Users, Crown, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  keyword: string;
  imageUrl: string;
  imageAlt: string;
  excerpt: string;
  tags: string[];
  schema: object;
  createdAt: string;
  estimatedReadTime: number;
  seoScore: number;
}

interface BlogGenerationRequest {
  keyword: string;
  topic?: string;
  targetCountry?: string;
  contentLength?: 'short' | 'medium' | 'long';
  includeImages?: boolean;
}

interface BulkBlogJob {
  id: number;
  name: string;
  keywords: string[];
  targetCountry: string;
  contentLength: 'short' | 'medium' | 'long';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalPosts: number;
  completedPosts: number;
  failedPosts: number;
  createdAt: string;
  processingStarted?: string;
  processingCompleted?: string;
}

interface BulkGenerationRequest {
  name: string;
  keywords: string[];
  targetCountry: string;
  contentLength: 'short' | 'medium' | 'long';
}

export default function BlogGenerator() {
  const [keyword, setKeyword] = useState("");
  const [topic, setTopic] = useState("");
  const [targetCountry, setTargetCountry] = useState("US");
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);
  
  // Bulk generation state
  const [bulkJobName, setBulkJobName] = useState("");
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Check user access rights
  const isAdmin = user?.isAdmin || user?.email === 'ottmar.francisca1969@gmail.com';
  const isPremium = user?.isPremium || isAdmin;
  const hasAccess = isAdmin || isPremium;

  // Query for bulk blog jobs
  const { data: bulkJobs = [], refetch: refetchJobs } = useQuery({
    queryKey: ['/api/blog/bulk-jobs'],
    enabled: hasAccess,
  });

  const generateBlogMutation = useMutation({
    mutationFn: async (data: BlogGenerationRequest) => {
      return await apiRequest('/api/blog/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedPost(data);
      toast({
        title: "Blog Post Generated!",
        description: "Your SEO-optimized blog post is ready with perfect meta tags and schema markup.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate blog post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: async (data: BulkGenerationRequest) => {
      return await apiRequest('/api/blog/bulk-generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setBulkJobName("");
      setBulkKeywords("");
      refetchJobs();
      toast({
        title: "Bulk Generation Started!",
        description: "Your bulk blog generation job has been queued. Check the status below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk Generation Failed",
        description: "Unable to start bulk generation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveBlogMutation = useMutation({
    mutationFn: async (blogPost: BlogPost) => {
      return await apiRequest('/api/blog/save', {
        method: 'POST',
        body: JSON.stringify(blogPost),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Saved!",
        description: "Your blog post has been saved and is ready for publishing.",
      });
    },
  });

  const handleGenerate = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to generate blog posts.",
        variant: "destructive",
      });
      return;
    }

    if (!hasAccess) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade to Pro plan or contact admin for blog generation access.",
        variant: "destructive",
      });
      return;
    }

    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword or topic to generate a blog post.",
        variant: "destructive",
      });
      return;
    }

    generateBlogMutation.mutate({
      keyword: keyword.trim(),
      topic: topic.trim() || undefined,
      targetCountry,
      contentLength,
      includeImages: true,
    });
  };

  const handleBulkGenerate = () => {
    if (!hasAccess) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade to Pro plan or contact admin for bulk generation access.",
        variant: "destructive",
      });
      return;
    }

    if (!bulkJobName.trim() || !bulkKeywords.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter job name and keywords for bulk generation.",
        variant: "destructive",
      });
      return;
    }

    const keywords = bulkKeywords.split('\n').map(k => k.trim()).filter(k => k);
    if (keywords.length === 0) {
      toast({
        title: "No Keywords Found",
        description: "Please enter at least one keyword.",
        variant: "destructive",
      });
      return;
    }

    bulkGenerateMutation.mutate({
      name: bulkJobName.trim(),
      keywords,
      targetCountry,
      contentLength,
    });
  };

  // Admin functions for blog management
  const handlePublishToWebsite = async (jobId: number) => {
    try {
      await apiRequest(`/api/blog/bulk-jobs/${jobId}/publish`, {
        method: 'POST',
      });
      toast({
        title: "Published Successfully",
        description: "Blog posts have been published to the website.",
      });
      refetchJobs();
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Unable to publish posts to website.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPosts = async (jobId: number) => {
    try {
      const response = await fetch(`/api/blog/bulk-jobs/${jobId}/download`, {
        method: 'GET',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blog-posts-${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Blog posts are being downloaded as a ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download posts.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await apiRequest(`/api/blog/bulk-jobs/${jobId}`, {
        method: 'DELETE',
      });
      toast({
        title: "Job Deleted",
        description: "Bulk generation job and all associated posts have been deleted.",
      });
      refetchJobs();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete job.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadHTML = () => {
    if (!generatedPost) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${generatedPost.metaTitle}</title>
    <meta name="description" content="${generatedPost.metaDescription}">
    <meta name="keywords" content="${generatedPost.tags.join(', ')}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="ContentScale AI">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${generatedPost.metaTitle}">
    <meta property="og:description" content="${generatedPost.metaDescription}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${generatedPost.imageUrl}">
    <meta property="og:url" content="https://contentscale.ai/blog/${generatedPost.slug}">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${generatedPost.metaTitle}">
    <meta name="twitter:description" content="${generatedPost.metaDescription}">
    <meta name="twitter:image" content="${generatedPost.imageUrl}">
    
    <!-- Schema.org Markup -->
    <script type="application/ld+json">
    ${JSON.stringify(generatedPost.schema, null, 2)}
    </script>
    
    <link rel="canonical" href="https://contentscale.ai/blog/${generatedPost.slug}">
</head>
<body>
    <article>
        <header>
            <h1>${generatedPost.title}</h1>
            <img src="${generatedPost.imageUrl}" alt="${generatedPost.imageAlt}" />
        </header>
        <div>
            ${generatedPost.content}
        </div>
    </article>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPost.slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Blog Post Generator
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Generate SEO-optimized blog posts with perfect meta tags, schema markup, and content scale optimization in seconds.
          </p>
        </div>

        {/* Access Control Notice */}
        {!hasAccess && (
          <Card className="bg-orange-500/20 border-orange-500/30 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-orange-400" />
                <div>
                  <h3 className="text-white font-semibold">Premium Feature</h3>
                  <p className="text-orange-200">
                    Blog generation is available for Pro subscribers and admin users. 
                    {!isPremium && " Upgrade to Pro plan via PayPal to unlock unlimited blog generation."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Badge */}
        {isAdmin && (
          <Card className="bg-emerald-500/20 border-emerald-500/30 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-white font-semibold">Admin Access</h3>
                  <p className="text-emerald-200">
                    You have unlimited access to all blog generation features including bulk generation and automatic website publishing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Generator */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="single" className="text-slate-300 data-[state=active]:text-white">
              Single Post Generation
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="text-slate-300 data-[state=active]:text-white"
              disabled={!hasAccess}
            >
              Bulk Generation {!hasAccess && "(Pro Only)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Single Blog Post Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Keyword *
                </label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., content scale, AI writing tools"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Topic (Optional)
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How to scale content production"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Country
                </label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full p-2 bg-slate-700 border-slate-600 text-white rounded-md"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="NL">Netherlands</option>
                  <option value="ES">Spain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content Length
                </label>
                <select
                  value={contentLength}
                  onChange={(e) => setContentLength(e.target.value as 'short' | 'medium' | 'long')}
                  className="w-full p-2 bg-slate-700 border-slate-600 text-white rounded-md"
                >
                  <option value="short">Short (800-1200 words)</option>
                  <option value="medium">Medium (1200-2000 words)</option>
                  <option value="long">Long (2000-3500 words)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerate}
                  disabled={generateBlogMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {generateBlogMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Generate Blog Post
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bulk">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bulk Blog Generation
            </CardTitle>
            <p className="text-slate-400">
              Generate multiple SEO-optimized blog posts simultaneously. Perfect for content scaling.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Name
                </label>
                <Input
                  value={bulkJobName}
                  onChange={(e) => setBulkJobName(e.target.value)}
                  placeholder="e.g., Content Marketing Campaign Q1"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Country
                </label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="NL">Netherlands</option>
                  <option value="ES">Spain</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Keywords (one per line)
              </label>
              <Textarea
                value={bulkKeywords}
                onChange={(e) => setBulkKeywords(e.target.value)}
                placeholder={`AI content writing
content scaling platform
automated content marketing
bulk content creation
SEO blog generator`}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 min-h-[120px]"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter each keyword on a new line. {bulkKeywords.split('\n').filter(k => k.trim()).length} keywords entered.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content Length
              </label>
              <select
                value={contentLength}
                onChange={(e) => setContentLength(e.target.value as 'short' | 'medium' | 'long')}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="short">Short (800-1200 words)</option>
                <option value="medium">Medium (1200-2000 words)</option>
                <option value="long">Long (2000-3500 words)</option>
              </select>
            </div>

            <Button 
              onClick={handleBulkGenerate} 
              disabled={bulkGenerateMutation.isPending || !hasAccess}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              {bulkGenerateMutation.isPending ? (
                <>
                  <Package className="w-4 h-4 mr-2 animate-spin" />
                  Starting Bulk Generation...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Start Bulk Generation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Jobs Status */}
        {hasAccess && bulkJobs.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Bulk Generation Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bulkJobs.map((job: BulkBlogJob) => (
                  <div key={job.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{job.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={job.status === 'completed' ? 'default' : 
                                 job.status === 'processing' ? 'secondary' : 
                                 job.status === 'failed' ? 'destructive' : 'outline'}
                        >
                          {job.status}
                        </Badge>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                          >
                            <span className="sr-only">Delete job</span>
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-slate-300 mb-3">
                      <div>Keywords: {job.keywords.length}</div>
                      <div>Completed: {job.completedPosts}/{job.totalPosts}</div>
                      <div>Failed: {job.failedPosts}</div>
                    </div>
                    {job.status === 'processing' && (
                      <Progress 
                        value={(job.completedPosts / job.totalPosts) * 100} 
                        className="h-2"
                      />
                    )}
                    {isAdmin && job.status === 'completed' && (
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePublishToWebsite(job.id)}
                          className="text-emerald-400 border-emerald-400 hover:bg-emerald-400/10"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Publish to Website
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadPosts(job.id)}
                          className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download Posts
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>

        {/* Generated Blog Post */}
        {generatedPost && (
          <div className="space-y-6">
            {/* SEO Metrics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  SEO Optimization Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <div className="text-green-400 font-semibold">SEO Score</div>
                    <div className="text-2xl font-bold text-white">{generatedPost.seoScore}/100</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold">Read Time</div>
                    <div className="text-2xl font-bold text-white">{generatedPost.estimatedReadTime} min</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3">
                    <div className="text-purple-400 font-semibold">Word Count</div>
                    <div className="text-2xl font-bold text-white">{generatedPost.content.split(' ').length}</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-3">
                    <div className="text-orange-400 font-semibold">Keywords</div>
                    <div className="text-2xl font-bold text-white">{generatedPost.tags.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">SEO Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-slate-700 rounded text-green-400">
                      /blog/{generatedPost.slug}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedPost.slug, 'Slug')}
                      className="border-slate-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Meta Title ({generatedPost.metaTitle.length} chars)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-slate-700 rounded text-white text-sm">
                      {generatedPost.metaTitle}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedPost.metaTitle, 'Meta Title')}
                      className="border-slate-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Meta Description ({generatedPost.metaDescription.length} chars)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-slate-700 rounded text-white text-sm">
                      {generatedPost.metaDescription}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedPost.metaDescription, 'Meta Description')}
                      className="border-slate-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Featured Image</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={generatedPost.imageUrl} 
                      alt={generatedPost.imageAlt}
                      className="w-20 h-20 rounded-lg object-cover bg-slate-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-slate-300 mb-1">Alt Text:</div>
                      <div className="text-white">{generatedPost.imageAlt}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedPost.tags.map((tag, index) => (
                      <Badge key={index} className="bg-indigo-500/20 text-indigo-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blog Content */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Generated Blog Post</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedPost.content, 'Blog Content')}
                      className="border-slate-600"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy HTML
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadHTML}
                      className="border-slate-600"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveBlogMutation.mutate(generatedPost)}
                      disabled={saveBlogMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Save Post
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-2xl font-bold text-white mb-4">{generatedPost.title}</h1>
                  <div 
                    className="text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schema Markup */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Schema.org Markup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <pre className="flex-1 p-4 bg-slate-700 rounded-lg text-sm text-green-400 overflow-x-auto">
                    {JSON.stringify(generatedPost.schema, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(generatedPost.schema, null, 2), 'Schema Markup')}
                    className="border-slate-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}