export interface User {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  typing: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Message {
  id: number;
  user: string;
  avatar: string;
  message: string;
  time: string;
  type: 'text' | 'voice';
  duration?: string;
  reactions?: Reaction[];
}

export interface Annotation {
  id: number;
  page: number;
  section: string;
  content: string;
  author: string;
  timestamp: string;
  color: string;
}
