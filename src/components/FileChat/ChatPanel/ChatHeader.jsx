import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  Video, 
  MoreHorizontal, 
  MicOff, 
  Mic, 
  VideoOff, 
  PhoneOff, 
  Users,
  Wifi,
  WifiOff 
} from 'lucide-react';

const ChatHeader = ({ 
  isInCall, 
  isVideoCall, 
  isMuted, 
  isVideoOn, 
  onlineUsers, 
  callHandlers,
  isConnected 
}) => {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center space-x-2">
          <MessageCircle size={20} className="text-cyan-400" />
          <span>Team Chat</span>
          {isConnected ? (
            <Wifi size={14} className="text-green-400 ml-2" />
          ) : (
            <WifiOff size={14} className="text-red-400 ml-2 animate-pulse" />
          )}
        </h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={callHandlers.startVoiceCall}
            disabled={isInCall || !isConnected}
            className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
            title={!isConnected ? "Reconnecting..." : "Start voice call"}
          >
            <Phone size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={callHandlers.startVideoCall}
            disabled={isInCall || !isConnected}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
            title={!isConnected ? "Reconnecting..." : "Start video call"}
          >
            <Video size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            disabled={!isConnected}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Active Call UI */}
      {isInCall && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 mb-3 
                      border border-green-500/30 relative overflow-hidden">
          {!isConnected && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center 
                          justify-center text-red-400 text-sm">
              <WifiOff size={14} className="mr-2 animate-pulse" />
              Reconnecting...
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isVideoCall ? 
                <Video size={16} className="text-blue-400" /> : 
                <Phone size={16} className="text-green-400" />
              }
              <span className="text-sm font-medium">
                {isVideoCall ? 'Video Call' : 'Voice Call'} Active
              </span>
            </div>
            <div className="text-xs text-gray-400">
              <CallTimer />
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mt-3">
            <button
              onClick={callHandlers.toggleMute}
              disabled={!isConnected}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            
            {isVideoCall && (
              <button
                onClick={callHandlers.toggleVideo}
                disabled={!isConnected}
                className={`p-2 rounded-lg transition-colors ${
                  !isVideoOn ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
            )}
            
            <button
              onClick={callHandlers.endCall}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected}
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center">
          <Users size={14} className="mr-1" />
          <span>{onlineUsers.length} online</span>
        </div>
        {!isConnected && (
          <span className="text-yellow-400 flex items-center">
            <WifiOff size={12} className="mr-1 animate-pulse" />
            Reconnecting...
          </span>
        )}
      </div>
    </div>
  );
};

const CallTimer = () => {
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return formatTime(duration);
};

export default ChatHeader;