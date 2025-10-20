import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: 'Username is required' })
    .max(150, { message: 'Username must be less than 150 characters' })
    .regex(/^[\w.@+-]+$/, { 
      message: 'Username can only contain letters, numbers, and @/./+/-/_ characters' 
    }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .max(128, { message: 'Password must be less than 128 characters' }),
});

export const chatRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Room name is required' })
    .max(100, { message: 'Room name must be less than 100 characters' }),
});

export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Message cannot be empty' })
    .max(2000, { message: 'Message must be less than 2000 characters' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChatRoomInput = z.infer<typeof chatRoomSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
