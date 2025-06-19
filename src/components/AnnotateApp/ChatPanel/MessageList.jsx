import React from 'react';
import { Play, Pause } from 'lucide-react';

const MessageList = ({ 
  messages, 
  playingVoiceNote, 
  toggleVoiceNote, 
  addReaction, 
  chatRef 
}) => {
  // Find typing users
  const typingUsers = messages
    .filter(msg => msg.typing)
    .map(msg => msg.user);

  return (
    <div ref={chatRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] ${msg.user === 'You' ? 'order-2' : 'order-1'}`}>
            <div className="flex items-end space-x-2 mb-1">
              {msg.user !== 'You' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xs">
                  {msg.avatar}
                </div>
              )}
              <div className={`px-4 py-2 rounded-2xl ${msg.user === 'You' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                : 'bg-white/10 text-white'} ${msg.type === 'voice' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' : ''}`}>
                
                {msg.type === 'text' && (
                  <p className="text-sm">{msg.message}</p>
                )}
                
                {msg.type === 'voice' && (
                  <VoiceMessage 
                    msg={msg} 
                    playingVoiceNote={playingVoiceNote} 
                    toggleVoiceNote={toggleVoiceNote} 
                  />
                )}
              </div>
              {msg.user === 'You' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-xs">
                  👨‍💻
                </div>
              )}
            </div>
            
            <MessageFooter 
              msg={msg} 
              addReaction={addReaction} 
            />
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator />
      )}
    </div>
  );
};

const VoiceMessage = ({ msg, playingVoiceNote, toggleVoiceNote }) => (
  <div className="flex items-center space-x-3 min-w-[120px]">
    <button
      onClick={() => toggleVoiceNote(msg.id)}
      className="p-1 rounded-full bg-purple-500/30 hover:bg-purple-500/50 transition-colors"
    >
      {playingVoiceNote === msg.id ? <Pause size={12} /> : <Play size={12} />}
    </button>
    <div className="flex-1">
      <div className="flex items-center space-x-1 mb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1 bg-purple-400 rounded-full ${playingVoiceNote === msg.id ? 'animate-pulse' : ''}`} 
            style={{ height: Math.random() * 20 + 8 }}
          />
        ))}
      </div>
      <div className="text-xs text-gray-300">{msg.duration}</div>
    </div>
  </div>
);

const MessageFooter = ({ msg, addReaction }) => (
  <div className={`flex items-center space-x-2 text-xs text-gray-500 ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
    <span>{msg.time}</span>
    {msg.reactions && msg.reactions.length > 0 && (
      <div className="flex items-center space-x-1">
        {msg.reactions.map((reaction, index) => (
          <button
            key={index}
            onClick={() => addReaction(msg.id, reaction.emoji)}
            className="flex items-center space-x-1 bg-white/10 px-2 py-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <span className="text-xs">{reaction.emoji}</span>
            <span className="text-xs">{reaction.count}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xs">
        👨‍💻
      </div>
      <div className="bg-white/10 px-4 py-2 rounded-2xl">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export default MessageList;