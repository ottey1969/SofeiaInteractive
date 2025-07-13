import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Brain, User, Shield, Copy, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { responseHandler, type MessageType } from "@/utils/ResponseHandler";
import type { Conversation, Message } from "@/types";

interface ChatInterfaceProps {
  conversation: Conversation | null;
  messages: Message[];
  onConversationCreated: (conversation: Conversation) => void;
  onMessageSent: (userMessage?: string) => void;
}

export default function ChatInterface({
  conversation,
  messages,
  onConversationCreated,
  onMessageSent
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Copy functions
  const copyToClipboard = async (text: string, type: 'text' | 'html' = 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `Content copied as ${type === 'html' ? 'HTML' : 'text'}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyAsHTML = async (content: string) => {
    // Convert content to proper HTML if it's not already
    const htmlContent = content.includes('<') ? content : `<p>${content.replace(/\n/g, '</p><p>')}</p>`;
    await copyToClipboard(htmlContent, 'html');
  };

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (newConversation) => {
      onConversationCreated(newConversation);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
      // Send the stored message to the new conversation
      if (message.trim()) {
        const messageType = responseHandler.categorizeMessage(message);
        sendMessageMutation.mutate({
          conversationId: newConversation.id,
          message,
          messageType
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Conversation creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message, messageType }: { conversationId: number; message: string; messageType?: MessageType }) => {
      const response = await apiRequest("POST", "/api/chat", { conversationId, message, messageType });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${response.status}: ${errorData.message}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      const sentMessage = message;
      setMessage("");
      setIsTyping(true);
      onMessageSent(sentMessage);
      
      // Show question limit warning if applicable
      if (data.questionsRemaining !== undefined && data.questionsRemaining <= 1) {
        toast({
          title: "Question Limit Warning",
          description: `You have ${data.questionsRemaining} question${data.questionsRemaining === 1 ? '' : 's'} remaining today. Upgrade to Pro for unlimited questions.`,
          variant: "destructive",
        });
      }
      
      // Stop typing indicator after a delay
      setTimeout(() => setIsTyping(false), 30000);
    },
    onError: (error: any) => {
      if (error.message.includes('429')) {
        // Show upgrade modal for question limit
        const upgradeModal = document.querySelector('[data-upgrade-modal]') as HTMLButtonElement;
        if (upgradeModal) {
          upgradeModal.click();
        } else {
          toast({
            title: "Daily Limit Reached",
            description: "You've used all 3 daily questions. Upgrade to Pro for unlimited access!",
            variant: "destructive",
          });
        }
        return;
      }
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      const errorMessage = error.message || "Failed to send message";
      if (errorMessage.includes("Daily question limit reached")) {
        toast({
          title: "Limit Reached",
          description: "You've reached your daily question limit. Upgrade to Pro for unlimited questions.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim() || sendMessageMutation.isPending || createConversationMutation.isPending) return;

    // Categorize the message using ResponseHandler
    const messageType = responseHandler.categorizeMessage(message);
    console.log(`🔄 Frontend categorized message "${message}" as: ${messageType}`);

    if (!conversation) {
      // Create a new conversation first
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
      createConversationMutation.mutate(title);
    } else {
      sendMessageMutation.mutate({
        conversationId: conversation.id,
        message,
        messageType
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : 'flex items-start space-x-3'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-indigo-600 text-white rounded-2xl px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 text-right">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="text-white text-xs w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-700 rounded-2xl px-4 py-3 relative group">
                      <p className="text-sm whitespace-pre-wrap text-slate-200">{msg.content}</p>
                      
                      {/* Copy buttons - show on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(msg.content)}
                          className="h-6 w-6 p-0 bg-slate-600/50 hover:bg-slate-600 text-slate-300"
                          title="Copy as text"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyAsHTML(msg.content)}
                          className="h-6 w-6 p-0 bg-slate-600/50 hover:bg-slate-600 text-slate-300"
                          title="Copy as HTML"
                        >
                          <Code className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Welcome to Sofeia AI
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Your autonomous AI content assistant is ready to help with keyword research, 
              SEO optimization, and content strategy.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                Keyword Research
              </Badge>
              <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                SEO Strategy
              </Badge>
              <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                Content Analysis
              </Badge>
            </div>
          </div>
        )}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="text-white text-xs w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-slate-300 text-sm">Sofeia is researching and analyzing...</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-1">Analyzing your request</p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Sofeia about content strategy, SEO, or keyword research..." 
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[60px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending || createConversationMutation.isPending}
              className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Shield className="w-3 h-3 text-green-400" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
