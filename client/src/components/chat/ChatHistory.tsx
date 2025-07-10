import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Brain, FileText, Search } from "lucide-react";
import type { Conversation } from "@/types";

interface ChatHistoryProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export default function ChatHistory({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewConversation
}: ChatHistoryProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getConversationIcon = (title: string) => {
    if (/keyword|seo|search/i.test(title)) return Search;
    if (/content|write|blog/i.test(title)) return FileText;
    return Brain;
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-700">
        <Button 
          onClick={onNewConversation}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>
      </div>
      
      {/* Chat History */}
      <ScrollArea className="flex-1 p-4">
        <h3 className="text-slate-400 text-sm font-medium mb-3">Recent Conversations</h3>
        
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const isSelected = selectedConversation?.id === conversation.id;
            const Icon = getConversationIcon(conversation.title);
            
            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`rounded-lg p-3 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-indigo-600/20 border border-indigo-600/30' 
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-indigo-600' : 'bg-slate-600'
                  }`}>
                    <Icon className="text-white text-xs w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isSelected ? 'text-white' : 'text-slate-200'
                    }`}>
                      {conversation.title}
                    </p>
                    <span className={`text-xs ${
                      isSelected ? 'text-indigo-400' : 'text-slate-400'
                    }`}>
                      {formatRelativeTime(conversation.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No conversations yet</p>
              <p className="text-slate-500 text-xs">Start a new chat with Sofeia AI</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Support Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <i className="fab fa-whatsapp text-green-400"></i>
            <span className="text-slate-200 text-sm font-medium">Need Help?</span>
          </div>
          <p className="text-slate-400 text-xs mb-2">Contact support via WhatsApp</p>
          <a 
            href="https://wa.me/31628073996" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
          >
            +31 628 073 996
          </a>
        </div>
      </div>
    </div>
  );
}
