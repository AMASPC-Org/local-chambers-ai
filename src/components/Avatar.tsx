
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, X, Send, User, ChevronDown, Minimize2 } from 'lucide-react';
import { chamberGuideService } from '../services/ChamberGuideService';
import { ChatMessage } from '../types';

interface AvatarProps {
  initialMessage?: string;
  isVisible: boolean;
  chamberId?: string; // Optional context if we are on a specific chamber page
}

const Avatar: React.FC<AvatarProps> = ({ initialMessage = "Hi! I'm your Chamber Guide. How can I help you find, compare, or join a chamber today?", isVisible, chamberId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting if empty
  useEffect(() => {
    if (messages.length === 0 && initialMessage) {
      setMessages([{ role: 'assistant', content: initialMessage, timestamp: Date.now() }]);
    }
  }, [initialMessage]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call AI Service
      // We pass the history EXCLUDING the latest user message because the service usually takes (currentMessage, history)
      // Actually, looking at ChamberGuideService, it takes (message, history). 
      // So we pass the current history (which now HAS the user message? No, state updates are async).
      // Best practice: pass the array we just created.

      // Wait, generic LLM pattern: History usually implies "previous turns". 
      // The current user message is the "prompt". 
      // Let's pass the *current* state of messages as history (excluding the one we just added? 
      // Or does the backend expect full context? 
      // My backend controller implementation: history.forEach... then USER: message. 
      // So history should NOT contain the current message.
      const currentHistory = messages;

      const response = await chamberGuideService.chatWithGuide(userMsg.content, currentHistory, chamberId);

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [...prev, { role: 'system', content: "I'm having trouble connecting. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Animation variants
  const chatWindowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95, pointerEvents: 'none' as const },
    visible: { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' as const, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 20, scale: 0.95, pointerEvents: 'none' as const, transition: { duration: 0.2 } }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="bg-chamber-navy p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-chamber-gold/20 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-4 h-4 text-chamber-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Chamber Guide</h3>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-chamber-navy text-white rounded-tr-none'
                        : msg.role === 'system'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-none'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about chambers..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-chamber-gold/50 focus:border-chamber-gold outline-none transition-all placeholder:text-slate-400"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-chamber-navy text-white rounded-lg hover:bg-chamber-gold disabled:opacity-50 disabled:hover:bg-chamber-navy transition-colors transform hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">AI can make mistakes. Check important info.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Avatar */}
      <motion.div
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Unread Indicator if closed and has new messages (optional concept, skipping for now) */}

        {/* Glow */}
        <div className={`absolute inset-0 bg-chamber-gold/30 rounded-full blur-xl transition-opacity duration-500 ${isHovered || isOpen ? 'opacity-100' : 'opacity-0'}`} />

        {/* Main Circle */}
        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors duration-300 ${isOpen ? 'bg-chamber-gold' : 'bg-chamber-navy'}`}>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <ChevronDown className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div // The "Eye" or Icon
                key="open"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tooltip Label (only when closed) */}
        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-chamber-navy text-xs font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with Guide
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Avatar;
