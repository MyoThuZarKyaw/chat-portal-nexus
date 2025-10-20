import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatRoom } from '@/lib/api';
import { MessageCircle, Plus, LogOut, Trash2, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  onCreateRoom: (name: string) => void;
  onDeleteRoom: (roomId: number) => void;
  isLoading: boolean;
}

const ChatSidebar = ({
  chatRooms,
  selectedRoom,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
  isLoading,
}: ChatSidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="w-80 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col">
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary p-2 rounded-xl shadow-[var(--shadow-glow)]">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ChatHub
          </h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-[1.02]">
              <Plus className="h-4 w-4 mr-2" />
              New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create Chat Room</DialogTitle>
              <DialogDescription>
                Create a new room to start chatting with your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="Enter room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateRoom}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading rooms...</div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No rooms yet. Create one to get started!
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedRoom?.id === room.id
                    ? 'bg-[hsl(var(--sidebar-accent))] text-sidebar-accent-foreground shadow-md'
                    : 'hover:bg-[hsl(var(--sidebar-hover))] text-sidebar-foreground'
                }`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{room.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoom(room.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
