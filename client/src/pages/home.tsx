import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import ChatHistory from "@/components/chat/ChatHistory";
import AIActivityFeed from "@/components/chat/AIActivityFeed";
import ChatInterface from "@/components/chat/ChatInterface";
import PaymentModal from "@/components/modals/PaymentModal";
import { Button } from "@/components/ui/button";
import type { Conversation, Message, AIActivity, WebSocketMessage } from "@/types";

export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [aiActivities, setAiActivities] = useState<AIActivity[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Fetch conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  // Fetch messages for selected conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  // Fetch AI activities for selected conversation
  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.id, "activities"],
    enabled: !!selectedConversation,
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      if (selectedConversation) {
        // Add a small delay to ensure connection is fully established
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'join_conversation',
              conversationId: selectedConversation.id,
              userId: 'current_user'
            }));
          }
        }, 100);
      }
    };

    ws.onmessage = (event) => {
      try {
        console.log('WebSocket message received:', event.data);
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'ai_activity') {
          console.log('Adding AI activity:', message.data);
          setAiActivities(prev => [...prev, message.data]);
          refetchActivities();
        } else if (message.type === 'response_complete') {
          console.log('Response complete received:', message);
          refetchMessages();
          refetchActivities();
          setIsTyping(false);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [selectedConversation, refetchActivities, refetchMessages]);

  // Update WebSocket when conversation changes
  useEffect(() => {
    if (socket && selectedConversation && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'join_conversation',
        conversationId: selectedConversation.id,
        userId: 'current_user'
      }));
    }
  }, [socket, selectedConversation]);

  const handleNewConversation = async () => {
    setSelectedConversation(null);
    setAiActivities([]);
    setIsTyping(false);
    
    // Reset context on backend
    try {
      await fetch('/api/reset-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: 'chat_' + Date.now()
        })
      });
    } catch (error) {
      console.error('Error resetting context:', error);
    }
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    refetchConversations();
  };

  const handleMessageSent = (userMessage?: string) => {
    refetchMessages();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat History (narrower) */}
        <div className="w-1/4 bg-slate-800 border-r border-slate-700 flex flex-col">
          <ChatHistory 
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Middle Column - Welcome to Sofeia AI (Chat Interface) */}
        <div className="flex-1 flex flex-col">
          <ChatInterface 
            conversation={selectedConversation}
            messages={messages}
            onConversationCreated={handleConversationCreated}
            onMessageSent={handleMessageSent}
            isTyping={isTyping}
          />
        </div>

        {/* Right Sidebar - AI Brain Activity (narrower) */}
        <div className="w-1/4 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* AI Activity Header */}
          <div className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-brain text-white"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Sofeia AI Brain Activity</h2>
                  <p className="text-slate-400 text-sm">Real-time AI thinking and planning</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-emerald-400 text-sm">
                  {activities.some(a => a.status === 'active') ? 'Processing...' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Activity Feed */}
          <div className="flex-1 overflow-y-auto">
            <AIActivityFeed 
              activities={activities} 
              realTimeActivities={aiActivities}
              className="h-full"
            />
          </div>
          
          {/* API Integration Status */}
          <div className="bg-slate-900 border-t border-slate-700 p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">API Integrations</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Perplexity AI</span>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Anthropic Claude</span>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">PayPal</span>
                <span className="text-xs text-blue-400">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden trigger for payment modal */}
      <Button
        data-upgrade-modal
        className="hidden"
        onClick={() => setShowPaymentModal(true)}
      >
        Hidden Trigger
      </Button>

      {/* Payment Modal */}
      <PaymentModal 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
      />
    </div>
  );
}
