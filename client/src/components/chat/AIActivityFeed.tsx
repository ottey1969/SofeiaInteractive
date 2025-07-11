import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, Lightbulb, FileText, Globe, Bot, CreditCard } from "lucide-react";
import type { AIActivity } from "@/types";

interface AIActivityFeedProps {
  activities: AIActivity[];
  realTimeActivities: AIActivity[];
}

export default function AIActivityFeed({ activities, realTimeActivities }: AIActivityFeedProps) {
  const allActivities = [...activities, ...realTimeActivities];
  
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'research': return Search;
      case 'analysis': return BarChart3;
      case 'strategy': return Lightbulb;
      case 'generation': return FileText;
      default: return Bot;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'research': return 'blue';
      case 'analysis': return 'purple';
      case 'strategy': return 'emerald';
      case 'generation': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'animate-pulse';
      case 'completed': return 'bg-green-400';
      case 'failed': return 'bg-red-400';
      default: return 'bg-slate-600';
    }
  };

  return (
    <ScrollArea className="h-full p-6">
      <h3 className="text-slate-300 font-medium mb-4">AI Thinking Process</h3>
      
      <div className="space-y-4 mb-8">
        {allActivities.length > 0 ? (
          allActivities.map((activity, index) => {
            const Icon = getPhaseIcon(activity.phase);
            const phaseColor = getPhaseColor(activity.phase);
            
            return (
              <div
                key={activity.id || index}
                className={`bg-${phaseColor}-500/10 border border-${phaseColor}-500/30 rounded-lg p-4`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 bg-${phaseColor}-500 rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white text-xs w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-${phaseColor}-400 font-medium capitalize`}>
                      {activity.phase} Phase
                    </h4>
                    <span className="text-slate-400 text-xs capitalize">{activity.status}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                    <span className="text-slate-300">{activity.description}</span>
                  </div>
                  {activity.metadata?.step && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-slate-300">{activity.metadata.step}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Ready for your questions</p>
            <p className="text-slate-500 text-xs">Ask Sofeia anything about content strategy, SEO, or keyword research</p>
          </div>
        )}
      </div>

      {/* API Integrations Status */}
      <div>
        <h3 className="text-slate-300 font-medium mb-3">API Integrations</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Globe className="text-blue-400 w-4 h-4" />
              <span className="text-slate-300 text-sm">Perplexity AI</span>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Bot className="text-purple-400 w-4 h-4" />
              <span className="text-slate-300 text-sm">Anthropic Claude</span>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="text-blue-400 w-4 h-4" />
              <span className="text-slate-300 text-sm">PayPal</span>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Connected
            </Badge>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
