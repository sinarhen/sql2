'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '../ui/button';

export default function ChatComponent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isChatOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 border overflow-hidden flex flex-col">
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <h3 className="font-medium">AI Assistant</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-primary-dark"
              onClick={() => setIsChatOpen(false)}
            >
              ✕
            </Button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 flex flex-col space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`max-w-3/4 ${
                  message.role === 'user' 
                    ? 'ml-auto bg-primary text-white' 
                    : 'mr-auto bg-gray-100 text-gray-900'
                } rounded-lg p-3`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <div key={`${message.id}-${i}`}>{part.text}</div>;
                  }
                })}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="p-2 border-t flex">
            <input
              className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              value={input}
              placeholder="Ask a question..."
              onChange={handleInputChange}
            />
            <Button type="submit" className="rounded-l-none">
              Send
            </Button>
          </form>
        </div>
      ) : (
        <Button 
          className="rounded-full shadow-lg h-14 w-14"
          onClick={() => setIsChatOpen(true)}
        >
          💬
        </Button>
      )}
    </div>
  );
} 