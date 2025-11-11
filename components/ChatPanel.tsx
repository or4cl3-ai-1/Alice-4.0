import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, SenderType } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isRunning: boolean;
  isThinking: boolean;
}

const MicIcon: React.FC<{isListening: boolean}> = ({ isListening }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
      <path d="M5.5 9.5a.5.5 0 00-1 0v1a5 5 0 005 5v2.5a.5.5 0 001 0V15a5 5 0 005-5v-1a.5.5 0 00-1 0v1a4 4 0 01-8 0v-1z" />
    </svg>
);

const ChatMessageItem: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const baseClasses = "w-full flex mb-3 text-sm";
  const bubbleClasses = "px-4 py-2 rounded-lg max-w-xs md:max-w-md";

  const renderMessageContent = (message: string) => {
    return message.split('\n').map((line, index) => <p key={index} className="whitespace-pre-wrap">{line}</p>);
  };

  const renderCitations = (citations: ChatMessage['citations']) => (
    <div className="mt-2 border-t border-gray-600 pt-2">
        <p className="text-xs text-gray-400 font-bold mb-1">Sources:</p>
        <div className="space-y-1">
            {citations?.map((c, i) => (
                <a key={i} href={c.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 block truncate hover:underline">
                    {c.title}
                </a>
            ))}
        </div>
    </div>
  );

  switch (msg.senderType) {
    case SenderType.User:
      return (
        <div className={`${baseClasses} justify-end`}>
          <div className={`${bubbleClasses} bg-cyan-600 text-white`}>{renderMessageContent(msg.message)}</div>
        </div>
      );
    case SenderType.Agent:
      return (
        <div className={`${baseClasses} justify-start`}>
          <div className={`${bubbleClasses} bg-gray-700`}>
            <p className="font-bold text-purple-400 text-xs">{msg.sender}</p>
            {renderMessageContent(msg.message)}
            {msg.citations && msg.citations.length > 0 && renderCitations(msg.citations)}
          </div>
        </div>
      );
    case SenderType.System:
       return (
        <div className={`${baseClasses} justify-start`}>
          <div className={`${bubbleClasses} bg-transparent border border-pink-500/50 text-pink-400`}>
             <p className="font-bold text-pink-500 text-xs">A.L.I.C.E. KERNEL</p>
             {renderMessageContent(msg.message)}
          </div>
        </div>
      );
    default: return null;
  }
};

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isRunning, isThinking }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleTranscript = (text: string) => {
    setInput(text);
    onSendMessage(text);
  };
  
  const { isListening, toggleListening, isSupported } = useSpeechToText(handleTranscript);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isRunning && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const placeholderText = !isRunning ? 'System offline.' : isThinking ? 'A.L.I.C.E. is thinking...' : 'Type or use mic...';

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-bold text-cyan-400 mb-2 flex-shrink-0 p-4 border-b border-cyan-400/20">Communications</h2>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.slice().reverse().map((msg) => <ChatMessageItem key={msg.id} msg={msg} />)}
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
          {isSupported && (
            <button type="button" onClick={toggleListening} className="p-2" disabled={!isRunning || isThinking}>
              <MicIcon isListening={isListening} />
            </button>
          )}
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
