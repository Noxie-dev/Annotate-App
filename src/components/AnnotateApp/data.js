export const initialOnlineUsers = [
  { id: 1, name: 'Sophia', avatar: '👩‍💼', status: 'online', typing: false },
  { id: 2, name: 'Liam', avatar: '👨‍💻', status: 'online', typing: true },
  { id: 3, name: 'Maya', avatar: '👩‍🎨', status: 'away', typing: false }
];

export const initialMessages = [
  {
    id: 1,
    user: 'Sophia',
    avatar: '👩‍💼',
    message: "Hi team, I've reviewed the document and added some annotations. Please take a look and let me know if you have any questions.",
    time: '10:23 AM',
    type: 'text',
    reactions: [{ emoji: '👍', count: 2 }, { emoji: '❤️', count: 1 }]
  },
  {
    id: 2,
    user: 'You',
    avatar: '👨‍💻',
    message: "Thanks, Sophia! I'll check them out now.",
    time: '10:25 AM',
    type: 'text'
  },
  {
    id: 3,
    user: 'Maya',
    avatar: '👩‍🎨',
    message: '',
    time: '10:27 AM',
    type: 'voice',
    duration: '0:23',
    reactions: [{ emoji: '🔥', count: 1 }]
  }
];