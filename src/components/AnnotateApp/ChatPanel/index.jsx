import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatPanel = ({ 
  messages,
  message,
  setMessage,
  isInCall,
  isVideoCall,
  isMuted,
  isVideoOn,
  playingVoiceNote,
  onlineUsers,
  chatRef,
  callHandlers,
  toggleVoiceNote,
  addReaction,
  sendMessage,
  isRecording,
  toggleRecording,
  error,
  isConnected
}) => {
  return (
    <div className="w-96 bg-black/20 backdrop-blur-lg border-l border-white/10 flex flex-col">
      <ChatHeader 
        isInCall={isInCall}
        isVideoCall={isVideoCall}
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        onlineUsers={onlineUsers}
        callHandlers={callHandlers}
        isConnected={isConnected}
      />
      
      {error && (
        <div className="bg-red-500/20 text-red-200 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      
      <MessageList 
        messages={messages}
        playingVoiceNote={playingVoiceNote}
        toggleVoiceNote={toggleVoiceNote}
        addReaction={addReaction}
        chatRef={chatRef}
      />
      
      <MessageInput 
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        isConnected={isConnected}
      />
    </div>
  );
};

export default ChatPanel;