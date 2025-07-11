import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import ChatHistory from "@/components/chat/ChatHistory";
import AIActivityFeed from "@/components/chat/AIActivityFeed";
import ChatInterface from "@/components/chat/ChatInterface";
import type { Conversation, Message, AIActivity, WebSocketMessage } from "@/types";

export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [aiActivities, setAiActivities] = useState<AIActivity[]>([]);
  
  // Check for demo mode
  const isDemoMode = typeof window !== 'undefined' && sessionStorage.getItem('demo_mode') === 'true';

  // Fetch conversations (skip in demo mode)
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !isDemoMode,
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
        ws.send(JSON.stringify({
          type: 'join_conversation',
          conversationId: selectedConversation.id,
          userId: 'current_user' // This would come from auth context
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'ai_activity') {
          setAiActivities(prev => [...prev, message.data]);
          refetchActivities();
        } else if (message.type === 'response_complete') {
          refetchMessages();
          refetchActivities();
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
    if (socket && selectedConversation) {
      socket.send(JSON.stringify({
        type: 'join_conversation',
        conversationId: selectedConversation.id,
        userId: 'current_user'
      }));
    }
  }, [socket, selectedConversation]);

  const handleNewConversation = () => {
    setSelectedConversation(null);
    setAiActivities([]);
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    refetchConversations();
  };

  const handleMessageSent = () => {
    refetchMessages();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Header />
      
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-yellow-600/20 border-b border-yellow-500/30 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 text-sm font-medium">Demo Mode Active</span>
              <span className="text-yellow-300/70 text-sm">- Limited functionality for testing</span>
            </div>
            <button 
              onClick={() => { sessionStorage.removeItem('demo_mode'); window.location.reload(); }}
              className="text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat History */}
        <div className="w-1/3 bg-slate-800 border-r border-slate-700 flex flex-col">
          <ChatHistory 
            conversations={isDemoMode ? [] : conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Right Panel - AI Activity & Chat */}
        <div className="flex-1 flex flex-col bg-slate-900">
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

          {/* AI Activity Feed & Chat Interface */}
          <div className="flex-1 flex">
            {/* AI Brain Visualization */}
            <div className="w-1/2 border-r border-slate-700">
              <AIActivityFeed 
                activities={activities} 
                realTimeActivities={aiActivities}
              />
            </div>

            {/* Chat Interface */}
            <div className="w-1/2">
              <ChatInterface 
                conversation={selectedConversation}
                messages={messages}
                onConversationCreated={handleConversationCreated}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
