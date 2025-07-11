// Enhanced New Chat functionality
class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.chatHistory = [];
        this.isProcessing = false;
    }

    // Create a new chat session
    async createNewChat() {
        // Save current chat if it exists
        if (this.currentChatId && this.chatHistory.length > 0) {
            await this.saveChatToHistory();
        }

        // Generate new chat ID
        this.currentChatId = 'chat_' + Date.now();
        this.chatHistory = [];
        
        // Clear the UI
        this.clearChatInterface();
        
        // Reset AI context on backend
        await this.resetAIContext();
        
        // Show confirmation
        this.showNotification('New chat started', 'success');
        
        // Update UI state
        this.updateChatState();
    }

    clearChatInterface() {
        const conversationArea = document.querySelector('.conversation-area');
        const inputArea = document.querySelector('.input-textarea');
        
        if (conversationArea) {
            conversationArea.innerHTML = `
                <div class="welcome-message">
                    <h3>Welcome to Sofeia AI</h3>
                    <p>Your autonomous AI content assistant is ready to help with keyword research, SEO optimization, and content strategy.</p>
                    
                    <div class="quick-actions">
                        <button class="quick-action-btn" onclick="this.handleQuickAction('keyword research')">Keyword Research</button>
                        <button class="quick-action-btn" onclick="this.handleQuickAction('SEO strategy')">SEO Strategy</button>
                        <button class="quick-action-btn" onclick="this.handleQuickAction('content analysis')">Content Analysis</button>
                    </div>
                </div>
            `;
        }
        
        if (inputArea) {
            inputArea.value = '';
            inputArea.focus();
        }
        
        // Reset thinking process display
        const thinkingArea = document.querySelector('.ai-thinking-process');
        if (thinkingArea) {
            thinkingArea.innerHTML = `
                <h4>AI Thinking Process</h4>
                <p>Ready for your questions</p>
                <p class="subtitle">Ask Sofeia anything about content strategy, SEO, or keyword research</p>
            `;
        }
    }

    async resetAIContext() {
        try {
            const response = await fetch('/api/reset-context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId: this.currentChatId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to reset AI context');
            }
        } catch (error) {
            console.error('Error resetting AI context:', error);
        }
    }

    async saveChatToHistory() {
        const chatData = {
            id: this.currentChatId,
            timestamp: new Date().toISOString(),
            messages: [...this.chatHistory],
            title: this.generateChatTitle()
        };
        
        // Save to localStorage for now (replace with backend API later)
        const savedChats = JSON.parse(localStorage.getItem('sofeia_chats') || '[]');
        savedChats.unshift(chatData);
        
        // Keep only last 50 chats
        if (savedChats.length > 50) {
            savedChats.splice(50);
        }
        
        localStorage.setItem('sofeia_chats', JSON.stringify(savedChats));
    }

    generateChatTitle() {
        if (this.chatHistory.length === 0) return 'Empty Chat';
        
        const firstMessage = this.chatHistory.find(msg => msg.type === 'user');
        if (firstMessage) {
            return firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
        }
        
        return 'Chat ' + new Date().toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateChatState() {
        // Update any UI elements that depend on chat state
        const newChatButton = document.querySelector('.new-chat-button');
        if (newChatButton) {
            newChatButton.disabled = false;
        }
    }

    handleQuickAction(action) {
        const textarea = document.querySelector('.input-textarea');
        if (textarea) {
            textarea.value = `Help me with ${action}`;
            textarea.focus();
        }
    }
}

// Initialize chat manager
const chatManager = new ChatManager();

// Auto-resize textarea functionality
function setupAutoResizeTextarea() {
    const textarea = document.querySelector('.input-textarea');
    if (!textarea) return;

    function autoResize() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (window.sendMessage) {
                window.sendMessage();
            }
        }
    });

    // Initial resize
    autoResize();
}

// Export for use in other modules
window.chatManager = chatManager;
window.setupAutoResizeTextarea = setupAutoResizeTextarea;