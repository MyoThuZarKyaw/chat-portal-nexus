import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { chatRoomsApi, messagesApi, ChatRoom, Message } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';

const Chat = () => {
  const { token, userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (token) {
      loadChatRooms();
      loadMessages();
    }
  }, [token]);

  useEffect(() => {
    if (selectedRoom && token) {
      loadMessages();
    }
  }, [selectedRoom, token]);

  const loadChatRooms = async () => {
    if (!token) return;
    setIsLoadingRooms(true);
    try {
      const rooms = await chatRoomsApi.getAll(token);
      setChatRooms(rooms);
      if (rooms.length > 0 && !selectedRoom) {
        setSelectedRoom(rooms[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chat rooms',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadMessages = async () => {
    if (!token) return;
    setIsLoadingMessages(true);
    try {
      const allMessages = await messagesApi.getAll(token);
      if (selectedRoom) {
        const roomMessages = allMessages.filter((msg) => msg.chat_room === selectedRoom.id);
        setMessages(roomMessages);
      } else {
        setMessages(allMessages);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!token || !userId || !selectedRoom) return;
    
    try {
      await messagesApi.send(token, content, userId, selectedRoom.id, []);
      await loadMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleCreateRoom = async (name: string) => {
    if (!token) return;
    
    try {
      const newRoom = await chatRoomsApi.create(token, name);
      setChatRooms([...chatRooms, newRoom]);
      setSelectedRoom(newRoom);
      toast({
        title: 'Success',
        description: 'Chat room created',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!token) return;
    
    try {
      await chatRoomsApi.delete(token, roomId);
      const updatedRooms = chatRooms.filter((room) => room.id !== roomId);
      setChatRooms(updatedRooms);
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(updatedRooms.length > 0 ? updatedRooms[0] : null);
      }
      toast({
        title: 'Success',
        description: 'Chat room deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete chat room',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[hsl(var(--chat-background))]">
      <ChatSidebar
        chatRooms={chatRooms}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        onCreateRoom={handleCreateRoom}
        onDeleteRoom={handleDeleteRoom}
        isLoading={isLoadingRooms}
      />
      <ChatWindow
        selectedRoom={selectedRoom}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUserId={userId}
        isLoading={isLoadingMessages}
      />
    </div>
  );
};

export default Chat;
