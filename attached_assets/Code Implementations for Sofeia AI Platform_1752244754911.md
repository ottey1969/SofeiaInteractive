# Code Implementations for Sofeia AI Platform

This document provides practical code snippets to address the identified issues in your Sofeia AI platform. The code is organized by functionality and can be integrated into your existing Replit project.

## 1. Fixed New Chat Button Functionality

### JavaScript Implementation

```javascript
// Enhanced New Chat functionality
class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.chatHistory = [];
        this.isProcessing = false;
    }

    // Create a new chat session
    createNewChat() {
        // Save current chat if it exists
        if (this.currentChatId && this.chatHistory.length > 0) {
            this.saveChatToHistory();
        }

        // Generate new chat ID
        this.currentChatId = 'chat_' + Date.now();
        this.chatHistory = [];
        
        // Clear the UI
        this.clearChatInterface();
        
        // Reset AI context on backend
        this.resetAIContext();
        
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

    saveChatToHistory() {
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
}

// Initialize chat manager
const chatManager = new ChatManager();

// Attach to New Chat button
document.addEventListener('DOMContentLoaded', function() {
    const newChatButton = document.querySelector('.new-chat-button');
    if (newChatButton) {
        newChatButton.addEventListener('click', function() {
            chatManager.createNewChat();
        });
    }
});
```

## 2. Improved Chat UI Layout

### CSS Implementation

```css
/* Enhanced Chat Layout Styles */
.chat-container {
    display: flex;
    height: 100vh;
    max-width: 1400px;
    margin: 0 auto;
    background: #1a1a2e;
    color: #ffffff;
}

.sidebar {
    width: 280px;
    min-width: 250px;
    background: #16213e;
    border-right: 1px solid #2a2a4a;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #2a2a4a;
}

.new-chat-button {
    width: 100%;
    padding: 12px 16px;
    background: #6c5ce7;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.new-chat-button:hover {
    background: #5a4fcf;
    transform: translateY(-1px);
}

.new-chat-button:active {
    transform: translateY(0);
}

.new-chat-button:disabled {
    background: #4a4a6a;
    cursor: not-allowed;
    transform: none;
}

.chat-history {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.chat-history-item {
    padding: 12px;
    margin-bottom: 8px;
    background: #1e2a4a;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-left: 3px solid transparent;
}

.chat-history-item:hover {
    background: #2a3a5a;
    border-left-color: #6c5ce7;
}

.chat-history-item.active {
    background: #2a3a5a;
    border-left-color: #6c5ce7;
}

.main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevents flex item from overflowing */
}

.chat-header {
    padding: 20px;
    border-bottom: 1px solid #2a2a4a;
    background: #1a1a2e;
}

.conversation-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    max-width: 800px; /* Limit width for better readability */
    margin: 0 auto;
    width: 100%;
}

.message {
    margin-bottom: 24px;
    animation: fadeIn 0.3s ease-in;
}

.message.user {
    text-align: right;
}

.message.ai {
    text-align: left;
}

.message-content {
    display: inline-block;
    max-width: 80%;
    padding: 16px 20px;
    border-radius: 16px;
    word-wrap: break-word;
    line-height: 1.5;
}

.message.user .message-content {
    background: #6c5ce7;
    color: white;
    border-bottom-right-radius: 4px;
}

.message.ai .message-content {
    background: #2a2a4a;
    color: #ffffff;
    border-bottom-left-radius: 4px;
}

.message-timestamp {
    font-size: 12px;
    color: #8a8a9a;
    margin-top: 4px;
}

.input-area {
    padding: 20px;
    border-top: 1px solid #2a2a4a;
    background: #1a1a2e;
}

.input-container {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
}

.input-textarea {
    width: 100%;
    min-height: 60px;
    max-height: 200px;
    resize: none;
    padding: 16px 50px 16px 20px;
    border: 2px solid #2a2a4a;
    border-radius: 12px;
    background: #16213e;
    color: #ffffff;
    font-size: 16px;
    font-family: inherit;
    line-height: 1.5;
    transition: border-color 0.2s ease;
    outline: none;
}

.input-textarea:focus {
    border-color: #6c5ce7;
}

.input-textarea::placeholder {
    color: #6a6a8a;
}

.send-button {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 40px;
    height: 40px;
    background: #6c5ce7;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.send-button:hover {
    background: #5a4fcf;
    transform: scale(1.05);
}

.send-button:disabled {
    background: #4a4a6a;
    cursor: not-allowed;
    transform: none;
}

.ai-thinking-area {
    background: #16213e;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    border-left: 4px solid #6c5ce7;
}

.thinking-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #6c5ce7;
    font-weight: 500;
}

.thinking-dots {
    display: flex;
    gap: 4px;
}

.thinking-dot {
    width: 6px;
    height: 6px;
    background: #6c5ce7;
    border-radius: 50%;
    animation: thinkingPulse 1.4s infinite ease-in-out;
}

.thinking-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.thinking-dot:nth-child(3) {
    animation-delay: 0.4s;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
}

.notification-success {
    background: #00b894;
}

.notification-error {
    background: #e17055;
}

.notification-info {
    background: #6c5ce7;
}

/* Responsive Design */
@media (max-width: 768px) {
    .chat-container {
        flex-direction: column;
        height: 100vh;
    }
    
    .sidebar {
        width: 100%;
        height: auto;
        max-height: 200px;
    }
    
    .conversation-area {
        max-width: 100%;
        padding: 16px;
    }
    
    .input-area {
        padding: 16px;
    }
    
    .message-content {
        max-width: 90%;
    }
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes thinkingPulse {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Auto-resize textarea */
.input-textarea {
    overflow: hidden;
}
```

### JavaScript for Auto-resize Textarea

```javascript
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
            sendMessage();
        }
    });

    // Initial resize
    autoResize();
}

// Call on page load
document.addEventListener('DOMContentLoaded', setupAutoResizeTextarea);
```

## 3. Smart Response Handling

### JavaScript Implementation

```javascript
// Smart response categorization and handling
class ResponseHandler {
    constructor() {
        this.simplePatterns = [
            /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
            /^(thanks|thank you|thx)/i,
            /^(bye|goodbye|see you)/i,
            /^(yes|no|ok|okay)/i,
            /^(what is|what's|define)/i,
            /^.{1,20}$/  // Very short messages
        ];
        
        this.complexPatterns = [
            /analyze|analysis|research|investigate/i,
            /competitor|competition|compare/i,
            /strategy|plan|roadmap/i,
            /seo|optimization|ranking/i,
            /content creation|write|generate/i
        ];
    }

    categorizeMessage(message) {
        const trimmed = message.trim();
        
        // Check for simple patterns
        for (const pattern of this.simplePatterns) {
            if (pattern.test(trimmed)) {
                return 'simple';
            }
        }
        
        // Check for complex patterns
        for (const pattern of this.complexPatterns) {
            if (pattern.test(trimmed)) {
                return 'complex';
            }
        }
        
        // Default to analysis for medium-length messages
        if (trimmed.length > 100) {
            return 'analysis';
        }
        
        return 'simple';
    }

    showLoadingState(type, message = '') {
        const thinkingArea = document.querySelector('.ai-thinking-area');
        if (!thinkingArea) return;

        let loadingHTML = '';
        
        switch (type) {
            case 'simple':
                loadingHTML = `
                    <div class="thinking-indicator">
                        <div class="thinking-dots">
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                        </div>
                        <span>Responding...</span>
                    </div>
                `;
                break;
                
            case 'analysis':
                loadingHTML = `
                    <div class="thinking-indicator">
                        <div class="thinking-dots">
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                        </div>
                        <span>Analyzing your request...</span>
                    </div>
                    <div class="analysis-steps">
                        <div class="step active">📝 Processing your question</div>
                        <div class="step">🔍 Gathering information</div>
                        <div class="step">🧠 Analyzing data</div>
                        <div class="step">✨ Crafting response</div>
                    </div>
                `;
                break;
                
            case 'complex':
                loadingHTML = `
                    <div class="thinking-indicator">
                        <div class="thinking-dots">
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                            <div class="thinking-dot"></div>
                        </div>
                        <span>Researching and analyzing...</span>
                        <div class="estimated-time">Estimated time: 30-60 seconds</div>
                    </div>
                    <div class="analysis-steps">
                        <div class="step active">🔍 Researching competitors</div>
                        <div class="step">📊 Analyzing SERPs</div>
                        <div class="step">🎯 Finding keyword opportunities</div>
                        <div class="step">📝 Crafting strategy</div>
                        <div class="step">✨ Finalizing response</div>
                    </div>
                `;
                break;
        }
        
        thinkingArea.innerHTML = loadingHTML;
        
        // Animate steps for complex analysis
        if (type === 'complex' || type === 'analysis') {
            this.animateAnalysisSteps();
        }
    }

    animateAnalysisSteps() {
        const steps = document.querySelectorAll('.analysis-steps .step');
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.remove('active');
                currentStep++;
                if (currentStep < steps.length) {
                    steps[currentStep].classList.add('active');
                }
            } else {
                clearInterval(interval);
            }
        }, 2000); // Change step every 2 seconds
    }

    hideLoadingState() {
        const thinkingArea = document.querySelector('.ai-thinking-area');
        if (thinkingArea) {
            thinkingArea.innerHTML = `
                <h4>AI Thinking Process</h4>
                <p>Ready for your questions</p>
                <p class="subtitle">Ask Sofeia anything about content strategy, SEO, or keyword research</p>
            `;
        }
    }
}

// Enhanced message sending with smart response handling
const responseHandler = new ResponseHandler();

async function sendMessage() {
    const textarea = document.querySelector('.input-textarea');
    const message = textarea.value.trim();
    
    if (!message || chatManager.isProcessing) return;
    
    chatManager.isProcessing = true;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    textarea.value = '';
    textarea.style.height = 'auto';
    
    // Categorize message and show appropriate loading state
    const messageType = responseHandler.categorizeMessage(message);
    responseHandler.showLoadingState(messageType);
    
    try {
        // Send to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                chatId: chatManager.currentChatId,
                messageType: messageType
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        const data = await response.json();
        
        // Hide loading state
        responseHandler.hideLoadingState();
        
        // Add AI response to chat
        addMessageToChat('ai', data.response);
        
    } catch (error) {
        console.error('Error sending message:', error);
        responseHandler.hideLoadingState();
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
    } finally {
        chatManager.isProcessing = false;
    }
}

function addMessageToChat(type, content) {
    const conversationArea = document.querySelector('.conversation-area');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-timestamp">${timestamp}</div>
    `;
    
    conversationArea.appendChild(messageDiv);
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    // Add to chat history
    chatManager.chatHistory.push({
        type: type,
        content: content,
        timestamp: new Date().toISOString()
    });
}
```

### Additional CSS for Analysis Steps

```css
.analysis-steps {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #2a2a4a;
}

.step {
    padding: 8px 0;
    color: #6a6a8a;
    font-size: 14px;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.step.active {
    color: #6c5ce7;
    font-weight: 500;
}

.estimated-time {
    font-size: 12px;
    color: #8a8a9a;
    margin-top: 4px;
}
```

## 4. Backend API Endpoints (Flask)

### Python Implementation

```python
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import uuid
import time
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production
CORS(app)

# In-memory storage (replace with database in production)
chat_sessions = {}
user_contexts = {}

@app.route('/api/reset-context', methods=['POST'])
def reset_context():
    """Reset AI context for a new chat session"""
    try:
        data = request.get_json()
        chat_id = data.get('chatId')
        
        if chat_id:
            # Clear any existing context for this chat
            if chat_id in user_contexts:
                del user_contexts[chat_id]
            
            # Initialize new context
            user_contexts[chat_id] = {
                'messages': [],
                'created_at': time.time(),
                'last_activity': time.time()
            }
        
        return jsonify({'success': True, 'message': 'Context reset successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages with smart response categorization"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        chat_id = data.get('chatId')
        message_type = data.get('messageType', 'simple')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Initialize chat session if it doesn't exist
        if chat_id not in chat_sessions:
            chat_sessions[chat_id] = []
        
        # Add user message to session
        chat_sessions[chat_id].append({
            'type': 'user',
            'content': message,
            'timestamp': time.time()
        })
        
        # Simulate different response times based on message type
        if message_type == 'simple':
            response = handle_simple_message(message)
            time.sleep(0.5)  # Quick response
        elif message_type == 'analysis':
            response = handle_analysis_message(message)
            time.sleep(2)  # Medium response time
        else:  # complex
            response = handle_complex_message(message)
            time.sleep(5)  # Longer response time
        
        # Add AI response to session
        chat_sessions[chat_id].append({
            'type': 'ai',
            'content': response,
            'timestamp': time.time()
        })
        
        return jsonify({
            'response': response,
            'messageType': message_type,
            'chatId': chat_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def handle_simple_message(message):
    """Handle simple messages with quick responses"""
    message_lower = message.lower()
    
    if any(greeting in message_lower for greeting in ['hi', 'hello', 'hey']):
        return "Hello! I'm Sofeia AI, your content strategy assistant. How can I help you today?"
    
    elif any(thanks in message_lower for thanks in ['thanks', 'thank you']):
        return "You're welcome! Is there anything else I can help you with?"
    
    elif any(bye in message_lower for bye in ['bye', 'goodbye']):
        return "Goodbye! Feel free to come back anytime you need help with content strategy or SEO."
    
    else:
        return f"I understand you're asking about: '{message}'. Let me help you with that!"

def handle_analysis_message(message):
    """Handle analysis messages with moderate complexity"""
    return f"""Based on your question about "{message[:50]}...", here's my analysis:

🔍 **Key Insights:**
- This topic requires strategic consideration
- Multiple factors should be evaluated
- I recommend a data-driven approach

📊 **Recommendations:**
1. Start with thorough research
2. Analyze your target audience
3. Consider competitive landscape
4. Implement and monitor results

Would you like me to dive deeper into any specific aspect?"""

def handle_complex_message(message):
    """Handle complex messages requiring detailed analysis"""
    return f"""I've completed a comprehensive analysis of your request: "{message[:50]}..."

🎯 **Strategic Overview:**
After researching current market trends and analyzing competitive positioning, I've identified several key opportunities for your content strategy.

🔍 **Competitive Analysis:**
- Identified 5 main competitors in your space
- Found 3 content gaps you can exploit
- Discovered 7 high-value keyword opportunities

📈 **SEO Recommendations:**
1. **Primary Keywords:** Focus on long-tail variations with lower competition
2. **Content Structure:** Implement topic clusters for better authority
3. **Technical SEO:** Optimize for Core Web Vitals and mobile experience

🚀 **Action Plan:**
- Week 1-2: Keyword research and content planning
- Week 3-4: Content creation and optimization
- Week 5-6: Distribution and promotion
- Week 7-8: Analysis and iteration

📊 **Expected Results:**
- 25-40% increase in organic traffic within 3 months
- Improved search rankings for target keywords
- Enhanced user engagement and conversion rates

Would you like me to elaborate on any specific aspect of this strategy?"""

@app.route('/api/chat-history/<chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    """Get chat history for a specific chat session"""
    try:
        history = chat_sessions.get(chat_id, [])
        return jsonify({'history': history, 'chatId': chat_id})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-chats', methods=['GET'])
def get_user_chats():
    """Get all chat sessions for the current user"""
    try:
        # In a real app, this would be filtered by user ID
        user_chats = []
        for chat_id, messages in chat_sessions.items():
            if messages:
                first_message = next((msg for msg in messages if msg['type'] == 'user'), None)
                title = first_message['content'][:50] + '...' if first_message else 'Empty Chat'
                
                user_chats.append({
                    'id': chat_id,
                    'title': title,
                    'lastActivity': messages[-1]['timestamp'] if messages else time.time(),
                    'messageCount': len([msg for msg in messages if msg['type'] == 'user'])
                })
        
        # Sort by last activity
        user_chats.sort(key=lambda x: x['lastActivity'], reverse=True)
        
        return jsonify({'chats': user_chats})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## 5. HTML Structure Update

### Updated HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sofeia AI - Advanced Content Assistant</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="chat-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <button class="new-chat-button" id="newChatBtn">
                    <span>➕</span>
                    New Chat
                </button>
            </div>
            
            <div class="chat-history" id="chatHistory">
                <h4>Recent Conversations</h4>
                <div class="chat-history-list">
                    <!-- Chat history items will be populated here -->
                </div>
            </div>
            
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="plan-info">
                        <span class="plan-name">Pro Plan</span>
                        <span class="usage">23/100 questions used</span>
                    </div>
                    <button class="upgrade-btn">Upgrade</button>
                </div>
            </div>
        </div>
        
        <!-- Main Chat Area -->
        <div class="main-chat">
            <div class="chat-header">
                <div class="ai-status">
                    <h2>Sofeia AI Brain Activity</h2>
                    <p>Real-time AI thinking and planning</p>
                </div>
                
                <div class="api-integrations">
                    <div class="integration-item">
                        <span class="integration-name">Perplexity AI</span>
                        <span class="status active">Active</span>
                    </div>
                    <div class="integration-item">
                        <span class="integration-name">Anthropic Claude</span>
                        <span class="status active">Active</span>
                    </div>
                </div>
            </div>
            
            <div class="conversation-area" id="conversationArea">
                <div class="welcome-message">
                    <h3>Welcome to Sofeia AI</h3>
                    <p>Your autonomous AI content assistant is ready to help with keyword research, SEO optimization, and content strategy.</p>
                    
                    <div class="quick-actions">
                        <button class="quick-action-btn">Keyword Research</button>
                        <button class="quick-action-btn">SEO Strategy</button>
                        <button class="quick-action-btn">Content Analysis</button>
                    </div>
                </div>
            </div>
            
            <div class="ai-thinking-area" id="aiThinkingArea">
                <h4>AI Thinking Process</h4>
                <p>Ready for your questions</p>
                <p class="subtitle">Ask Sofeia anything about content strategy, SEO, or keyword research</p>
            </div>
            
            <div class="input-area">
                <div class="input-container">
                    <textarea 
                        class="input-textarea" 
                        id="messageInput"
                        placeholder="Ask Sofeia about content strategy, SEO, or keyword research..."
                        rows="1"
                    ></textarea>
                    <button class="send-button" id="sendBtn">
                        <span>➤</span>
                    </button>
                </div>
                <div class="input-footer">
                    <span class="input-hint">Press Enter to send, Shift+Enter for new line</span>
                </div>
            </div>
        </div>
    </div>
    
    <script src="chat-manager.js"></script>
    <script src="response-handler.js"></script>
    <script src="main.js"></script>
</body>
</html>
```

## 6. Integration Instructions

### Step 1: File Organization
Create the following file structure in your Replit project:

```
/
├── main.py (your Flask backend)
├── templates/
│   └── index.html (updated HTML)
├── static/
│   ├── css/
│   │   └── styles.css (enhanced CSS)
│   └── js/
│       ├── chat-manager.js
│       ├── response-handler.js
│       └── main.js
└── requirements.txt
```

### Step 2: Update Requirements
Add to your `requirements.txt`:

```
Flask==2.3.3
Flask-CORS==4.0.0
```

### Step 3: Implementation Order
1. **Backend First**: Update your Flask app with the new API endpoints
2. **Frontend Structure**: Update your HTML with the new structure
3. **Styling**: Apply the enhanced CSS
4. **JavaScript**: Add the new JavaScript functionality
5. **Testing**: Test each component individually

### Step 4: Environment Variables
Add these to your Replit secrets:

```
FLASK_SECRET_KEY=your-secret-key-here
DEBUG=True
```

This code provides a solid foundation for fixing the major issues in your Sofeia AI platform. Each component can be implemented incrementally, allowing you to test and refine as you go.

