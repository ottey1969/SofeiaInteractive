// Smart response categorization and handling
class ResponseHandler {
    constructor() {
        this.simplePatterns = [
            /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
            /^(thanks|thank you|thx)/i,
            /^(bye|goodbye|see you)/i,
            /^(yes|no|ok|okay)/i,
            /^(what is|what's|define)/i,
            /^(test|testing)/i,
            /^.{1,15}$/  // Very short messages
        ];
        
        this.complexPatterns = [
            /analyze|analysis|research|investigate/i,
            /competitor|competition|compare/i,
            /strategy|plan|roadmap/i,
            /seo|optimization|ranking/i,
            /content creation|write|generate/i,
            /keyword research|keywords/i,
            /backlinks|link building/i,
            /serp|search results/i
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
                conversationId: chatManager.currentChatId || 1,
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
        addMessageToChat('ai', data.response || 'I apologize, but I encountered an issue processing your request. Please try again.');
        
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

// Export for global use
window.responseHandler = responseHandler;
window.sendMessage = sendMessage;
window.addMessageToChat = addMessageToChat;