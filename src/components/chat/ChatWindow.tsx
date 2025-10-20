import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatRoom, Message } from '@/lib/api';
import { Send, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { messageSchema } from '@/lib/validation';

interface ChatWindowProps {
  selectedRoom: ChatRoom | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: number | null;
  isLoading: boolean;
}

const ChatWindow = ({
  selectedRoom,
  messages,
  onSendMessage,
  currentUserId,
  isLoading,
}: ChatWindowProps) => {
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!selectedRoom) return;
    
    try {
      messageSchema.parse({ content: messageInput });
      onSendMessage(messageInput.trim());
      setMessageInput('');
    } catch (error) {
      console.error('Invalid message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--chat-background))]">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <Hash className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">No room selected</h3>
          <p className="text-muted-foreground">
            Select a room from the sidebar or create a new one to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center shadow-sm">
        <Hash className="h-5 w-5 text-muted-foreground mr-2" />
        <h2 className="text-lg font-semibold text-foreground">{selectedRoom.name}</h2>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender === currentUserId;
              const showTimestamp =
                index === 0 ||
                new Date(message.timestamp).getTime() -
                  new Date(messages[index - 1].timestamp).getTime() >
                  300000;

              return (
                <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {showTimestamp && (
                    <div className="text-center text-xs text-muted-foreground my-4">
                      {format(new Date(message.timestamp), 'PPp')}
                    </div>
                  )}
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                        isOwnMessage
                          ? 'bg-[hsl(var(--message-sent))] text-[hsl(var(--message-sent-foreground))] rounded-br-sm'
                          : 'bg-[hsl(var(--message-received))] text-[hsl(var(--message-received-foreground))] rounded-bl-sm'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="text-xs text-accent font-semibold mb-1">
                          User {message.sender}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {format(new Date(message.timestamp), 'p')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedRoom.name}`}
            className="flex-1 bg-input border-border focus-visible:ring-primary"
            maxLength={2000}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
