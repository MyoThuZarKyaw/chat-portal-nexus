const API_BASE_URL = 'https://message-app-backend-t3-2025-v2-eosin.vercel.app/api';

export interface ChatRoom {
  id: number;
  name: string;
}

export interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: number;
  chat_room: number;
  receiver: number[];
}

export interface LoginResponse {
  token: string;
  user_id: number;
}

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  logout: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Logout failed');
  },
};

// Chat Rooms API
export const chatRoomsApi = {
  getAll: async (token: string): Promise<ChatRoom[]> => {
    const response = await fetch(`${API_BASE_URL}/chat_rooms`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch chat rooms');
    return response.json();
  },

  create: async (token: string, name: string): Promise<ChatRoom> => {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create chat room');
    return response.json();
  },

  getDetail: async (token: string, id: number): Promise<ChatRoom> => {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${id}`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch chat room detail');
    return response.json();
  },

  delete: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete chat room');
  },
};

// Messages API
export const messagesApi = {
  getAll: async (token: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  send: async (
    token: string,
    content: string,
    sender: number,
    chatRoom: number,
    receiver: number[]
  ): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        sender,
        chat_room: chatRoom,
        receiver,
      }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  delete: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete message');
  },
};
