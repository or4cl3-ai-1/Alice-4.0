
import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import { ChatMessage, SenderType } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isRunning: boolean;
  isThinking: boolean;
  maxAgents: number;
  currentAgents: number;
}

const ChatMessageItem: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const baseClasses = "w-full flex mb-3 text-sm";
  const bubbleClasses = "px-4 py-2 rounded-lg max-w-xs md:max-w-md";

  switch (msg.senderType) {
    case SenderType.User:
      return (
        <div className={`${baseClasses} justify-end`}>
          <div className={`${bubbleClasses} bg-cyan-600 text-white`}>
            {msg.message}
          </div>
        </div>
      );
    case SenderType.Agent:
      return (
        <div className={`${baseClasses} justify-start`}>
          <div className={`${bubbleClasses} bg-gray-700`}>
            <p className="font-bold text-purple-400 text-xs">{msg.sender}</p>
            <p className="whitespace-pre-wrap">{msg.message}</p>
          </div>
        </div>
      );
    case SenderType.System:
       return (
        <div className={`${baseClasses} justify-start`}>
          <div className={`${bubbleClasses} bg-transparent border border-pink-500/50 text-pink-400`}>
             <p className="font-bold text-pink-500 text-xs">A.L.I.C.E. KERNEL</p>
            <p className="whitespace-pre-wrap">{msg.message}</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isRunning, isThinking, maxAgents, currentAgents }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // A slight delay ensures the new message is rendered before scrolling
    setTimeout(scrollToBottom, 50);
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isRunning && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const isAtMaxAgents = currentAgents >= maxAgents;
  const placeholderText = !isRunning ? 'System offline.' : isThinking ? 'A.L.I.C.E. is thinking...' : isAtMaxAgents ? 'Agent limit reached.' : 'Type /help or a message...';

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-bold text-cyan-400 mb-2 flex-shrink-0 p-4 border-b border-cyan-400/20">Communications</h2>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.slice().reverse().map((msg) => (
          <ChatMessageItem key={msg.id} msg={msg} />
        ))}
        {isThinking && (
            <div className="w-full flex mb-3 text-sm justify-start">
                <div className="px-4 py-2 rounded-lg max-w-xs md:max-w-md bg-gray-700/50">
                     <p className="font-bold text-pink-500 text-xs">A.L.I.C.E. KERNEL</p>
                     <div className="flex items-center space-x-1 mt-1">
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                     </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-400/20 flex-shrink-0">
        <div className="flex items-center bg-gray-800 border border-gray-600 rounded">
          <span className="text-cyan-400 pl-3 text-lg select-none">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderText}
            disabled={!isRunning || isThinking}
            className="w-full bg-transparent p-2 text-gray-200 focus:outline-none disabled:opacity-50"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!isRunning || !input.trim() || isThinking}
            className="bg-cyan-500 text-gray-900 font-bold py-2 px-4 rounded-r transition-colors hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
