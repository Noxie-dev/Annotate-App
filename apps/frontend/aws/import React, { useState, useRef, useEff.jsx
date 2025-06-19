import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Phone, 
  Video, 
  VideoOff,
  PhoneOff,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Users,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Download,
  Eye,
  EyeOff,
  Zap,
  Heart,
  Star,
  ThumbsUp
} from 'lucide-react';
import { PredictiveAssistanceEngine } from '../../core/IntelligenceEngines';

const AnnotateApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playingVoiceNote, setPlayingVoiceNote] = useState(null);
  const [onlineUsers] = useState([
    { id: 1, name: 'Sophia', avatar: '👩‍💼', status: 'online', typing: false },
    { id: 2, name: 'Liam', avatar: '👨‍💻', status: 'online', typing: true },
    { id: 3, name: 'Maya', avatar: '👩‍🎨', status: 'away', typing: false }
  ]);

  const [messages] = useState([
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
  ]);

  const chatRef = useRef(null);
  const recordingRef = useRef(null);

  // Initialize Predictive Assistance Engine
  const predictiveEngineRef = useRef(new PredictiveAssistanceEngine());

  useEffect(() => {
    if (isRecording) {
      recordingRef.current = setInterval(() => {
        // Simulate recording animation
      }, 100);
    } else {
      clearInterval(recordingRef.current);
    }
    return () => clearInterval(recordingRef.current);
  }, [isRecording]);

  // Log a predictive action sample on mount
  useEffect(() => {
    const prediction = predictiveEngineRef.current.predictNextAction('You', {
      documentId: 'doc1',
      currentPage: 1,
      totalPages: 12,
      completedActions: [],
      recentActions: []
    });
    console.log('Predictive action:', prediction);
  }, []);
  
  const startVoiceCall = () => {
    setIsInCall(true);
    setIsVideoCall(false);
  };
  
  const startVideoCall = () => {
    setIsInCall(true);
    setIsVideoCall(true);
  };
  
  const endCall = () => {
    setIsInCall(false);
    setIsVideoCall(false);
    setIsMuted(false);
    setIsVideoOn(true);
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  const sendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };
  
  const toggleVoiceNote = (id) => {
    setPlayingVoiceNote(playingVoiceNote === id ? null : id);
  };
  
  const addReaction = (messageId, emoji) => {
    // In real app, this would update the message reactions
    console.log(`Adding ${emoji} to message ${messageId}`);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center transform rotate-12">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AnnotateApp
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Document: Contract_v2.pdf</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Online Users */}
          <div className="flex items-center space-x-1">
            {onlineUsers.map((user) => (
              <div key={user.id} className="relative group">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-medium transition-transform hover:scale-110 cursor-pointer ${user.typing ? 'animate-bounce' : ''}`}>
                  {user.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {user.name} {user.typing && '(typing...)'}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setNotifications(!notifications)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {notifications ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Settings size={18} />
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-sm font-medium cursor-pointer">
            👨‍💻
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Annotations Panel */}
        <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">Annotations</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>12 Total</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>8 Yours</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-cyan-400">Page 1 - Clause 3.2</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={14} className="text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-300 mb-2">Need clarification on payment terms and delivery schedule.</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>by Sophia</span>
                <span>2 mins ago</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-purple-400">Page 2 - Section 4</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={14} className="text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-300 mb-2">Approved - looks good to proceed with these terms.</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>by You</span>
                <span>5 mins ago</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-yellow-400">Page 3 - Footer</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={14} className="text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-300 mb-2">Signature block needs to be updated with new format.</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>by Maya</span>
                <span>10 mins ago</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95">
              Save Annotation
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Document Viewer Placeholder */}
          <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-700 m-4 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
            <div className="relative z-10 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-lg">
                <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Document Viewer</h3>
              <p className="text-gray-400 mb-4">PDF renderer and annotation tools will be integrated here</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>📄 Contract_v2.pdf</span>
                <span>•</span>
                <span>Page 1 of 12</span>
                <span>•</span>
                <span>2.3MB</span>
              </div>
            </div>

            {/* Floating Collaboration Indicators */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-lg px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white">Live Session</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-lg px-3 py-2 rounded-full">
                <Zap size={12} className="text-yellow-400" />
                <span className="text-xs text-white">Real-time Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-96 bg-black/20 backdrop-blur-lg border-l border-white/10 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <MessageCircle size={20} className="text-cyan-400" />
                <span>Team Chat</span>
              </h2>
              <div className="flex items-center space-x-1">
                <button
                  onClick={startVoiceCall}
                  disabled={isInCall}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 transition-colors group"
                >
                  <Phone size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={startVideoCall}
                  disabled={isInCall}
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 transition-colors group"
                >
                  <Video size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                </button>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Active Call UI */}
            {isInCall && (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 mb-3 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isVideoCall ? <Video size={16} className="text-blue-400" /> : <Phone size={16} className="text-green-400" />}
                    <span className="text-sm font-medium">
                      {isVideoCall ? 'Video Call' : 'Voice Call'} Active
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">02:34</div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-lg transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  
                  {isVideoCall && (
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-2 rounded-lg transition-colors ${!isVideoOn ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}
                    >
                      {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>
                  )}
                  
                  <button
                    onClick={endCall}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <PhoneOff size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-400">
              <Users size={14} className="mr-1" />
              <span>{onlineUsers.length} online</span>
            </div>
          </div>

          {/* Messages */}
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
                                <div key={i} className={`w-1 bg-purple-400 rounded-full ${playingVoiceNote === msg.id ? 'animate-pulse' : ''}`} style={{ height: Math.random() * 20 + 8 }}></div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-300">{msg.duration}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    {msg.user === 'You' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-xs">
                        👨‍💻
                      </div>
                    )}
                  </div>
                  
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
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {onlineUsers.some(user => user.typing) && (
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
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            {/* Quick Reactions */}
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

            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                    <Smile size={16} className="text-gray-400" />
                  </button>
                  <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                    <Paperclip size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Voice Note Button */}
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-2xl transition-all transform ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
                  : 'bg-purple-500/20 hover:bg-purple-500/30'} hover:scale-105 active:scale-95`}
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
                disabled={!message.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center justify-center space-x-2 mt-3 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording voice note...</span>
                <span className="text-sm">0:05</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotateApp;