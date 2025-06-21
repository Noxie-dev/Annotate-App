import { useState, useRef, useEffect } from 'react';
import { useDocumentStore } from '@/stores/document-store';
import { useWebRTC } from '@/hooks/use-webrtc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import { VideoCall } from './VideoCall';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  PhoneCall,
  VideoIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ChatPanel() {
  const {
    chatMessages,
    addChatMessage,
    users,
    isTyping,
    setIsTyping,
    typingUsers
  } = useDocumentStore();

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [callTargetUserId, setCallTargetUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isInCall, isInitiating } = useWebRTC();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'user-1', // Current user
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    addChatMessage(newMessage);
    setMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording
  };

  const startVideoCall = (targetUserId?: string) => {
    setCallTargetUserId(targetUserId || null);
    setIsVideoCallOpen(true);
  };

  const startAudioCall = (targetUserId?: string) => {
    // For now, audio calls will use the same video call component
    // but with video disabled by default
    setCallTargetUserId(targetUserId || null);
    setIsVideoCallOpen(true);
  };

  const closeVideoCall = () => {
    setIsVideoCallOpen(false);
    setCallTargetUserId(null);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const renderMessage = (msg: ChatMessage) => {
    const user = getUserById(msg.userId);
    const isCurrentUser = msg.userId === 'user-1';

    return (
      <div
        key={msg.id}
        className={`flex space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
            {user?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 max-w-xs ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`rounded-lg px-3 py-2 ${
            isCurrentUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-[#0f1419] border border-gray-700 text-gray-200'
          }`}>
            {msg.type === 'voice' ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Mic className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <div className="w-24 h-2 bg-gray-300 rounded-full">
                    <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <span className="text-xs opacity-75">{msg.duration}s</span>
              </div>
            ) : (
              <p className="text-sm">{msg.content}</p>
            )}
          </div>
          
          <div className={`flex items-center space-x-2 mt-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-xs text-gray-400">{user?.name}</span>
            <span className="text-xs text-gray-500">{formatMessageTime(msg.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-200">Team Chat</h4>
              {(isInCall || isInitiating) && (
                <Badge className="bg-green-600 text-white text-xs">
                  {isInitiating ? 'Connecting...' : 'In Call'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {users.filter(u => u.status === 'online').length} online
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-200"
                  disabled={isInCall || isInitiating}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  onClick={() => startAudioCall()}
                  className="text-gray-200 hover:bg-gray-700"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Start Audio Call
                </DropdownMenuItem>
                {users.filter(u => u.status === 'online' && u.id !== 'user-1').map(user => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => startAudioCall(user.id)}
                    className="text-gray-200 hover:bg-gray-700"
                  >
                    <Avatar className="w-4 h-4 mr-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs" style={{ backgroundColor: user.color }}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    Call {user.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-200"
                  disabled={isInCall || isInitiating}
                >
                  <Video className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  onClick={() => startVideoCall()}
                  className="text-gray-200 hover:bg-gray-700"
                >
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Start Video Call
                </DropdownMenuItem>
                {users.filter(u => u.status === 'online' && u.id !== 'user-1').map(user => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => startVideoCall(user.id)}
                    className="text-gray-200 hover:bg-gray-700"
                  >
                    <Avatar className="w-4 h-4 mr-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs" style={{ backgroundColor: user.color }}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    Video call {user.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map(renderMessage)}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <span className="text-xs text-gray-400">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-200"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-[#0f1419] border-gray-600 text-gray-200 pr-20"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={`${isRecording ? 'text-red-400' : 'text-gray-400'} hover:text-gray-200`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs">Recording voice message...</span>
          </div>
        )}
      </div>

      {/* Video Call Component */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={closeVideoCall}
        targetUserId={callTargetUserId || undefined}
      />
    </div>
  );
}
