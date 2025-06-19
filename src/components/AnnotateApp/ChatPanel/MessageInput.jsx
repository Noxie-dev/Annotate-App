import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Mic, MicOff, Send, Wifi, WifiOff } from 'lucide-react';

const MessageInput = ({ 
  message, 
  setMessage, 
  sendMessage, 
  isRecording, 
  toggleRecording, 
  isConnected 
}) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      durationRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(durationRef.current);
      setRecordingDuration(0);
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border-t border-white/10">
      {/* Quick Reactions */}
      <QuickReactions />

      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 
                     focus:border-transparent transition-all disabled:opacity-50 
                     disabled:cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button 
              className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              disabled={!isConnected}
            >
              <Smile size={16} className="text-gray-400" />
            </button>
            <button 
              className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              disabled={!isConnected}
            >
              <Paperclip size={16} className="text-gray-400" />
            </button>
            {!isConnected && (
              <WifiOff size={16} className="text-red-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Voice Note Button */}
        <button
          onClick={toggleRecording}
          disabled={!isConnected}
          className={`p-3 rounded-2xl transition-all transform ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
              : 'bg-purple-500/20 hover:bg-purple-500/30'
          } hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <MicOff size={16} className="text-white" />
            </div>
          ) : (
            <Mic size={16} className="text-purple-400" />
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!message.trim() || !isConnected}
          className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 
                   hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-all transform 
                   hover:scale-105 active:scale-95"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <RecordingStatus duration={formatDuration(recordingDuration)} />
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="flex items-center justify-center space-x-2 mt-3 text-yellow-400">
          <WifiOff size={12} className="animate-pulse" />
          <span className="text-sm font-medium">Connecting to server...</span>
        </div>
      )}
    </div>
  );
};

const QuickReactions = () => (
  <div className="flex items-center space-x-2 mb-3">
    <span className="text-xs text-gray-400">Quick:</span>
    {['👍', '❤️', '🔥', '⭐', '✅'].map((emoji) => (
      <button
        key={emoji}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors hover:scale-110 transform"
      >
        <span className="text-sm">{emoji}</span>
      </button>
    ))}
  </div>
);

const RecordingStatus = ({ duration }) => (
  <div className="flex items-center justify-center space-x-2 mt-3 text-red-400">
    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
    <span className="text-sm font-medium">Recording voice note...</span>
    <span className="text-sm">{duration}</span>
  </div>
);

export default MessageInput;