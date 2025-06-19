import React, { useState, useRef, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';
import Header from './Header';
import AnnotationsPanel from './AnnotationsPanel';
import DocumentViewer from './DocumentViewer';
import ChatPanel from './ChatPanel';
import { initialOnlineUsers } from './data';
import { useWebSocket } from './hooks/useWebSocket';
import { useVoiceRecording } from './hooks/useVoiceRecording';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080/chat';

const AnnotateApp = () => {
  // State management
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playingVoiceNote, setPlayingVoiceNote] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(initialOnlineUsers);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Refs
  const chatRef = useRef(null);

  // Custom hooks
  const { isConnected, send, on } = useWebSocket(WEBSOCKET_URL);
  const { isRecording, startRecording, stopRecording } = useVoiceRecording();

  // WebSocket event handlers
  useEffect(() => {
    // Message handler
    on('message', (payload) => {
      setMessages(prev => [...prev, payload]);
    });

    // User status handler
    on('userStatus', (payload) => {
      setOnlineUsers(prev => {
        const index = prev.findIndex(user => user.id === payload.userId);
        if (index === -1) return [...prev, payload];
        return [...prev.slice(0, index), { ...prev[index], ...payload }, ...prev.slice(index + 1)];
      });
    });

    // Error handler
    on('error', (error) => {
      setError(error.message);
      // TODO: Implement error toast notification
    });
  }, [on]);

  // Call-related functions
  const callHandlers = {
    startVoiceCall: () => {
      setIsInCall(true);
      setIsVideoCall(false);
      send('call', { type: 'voice', action: 'start' });
    },
    startVideoCall: () => {
      setIsInCall(true);
      setIsVideoCall(true);
      send('call', { type: 'video', action: 'start' });
    },
    endCall: () => {
      setIsInCall(false);
      setIsVideoCall(false);
      setIsMuted(false);
      setIsVideoOn(true);
      send('call', { action: 'end' });
    },
    toggleMute: () => {
      setIsMuted(prev => !prev);
      send('call', { action: 'toggleMute' });
    },
    toggleVideo: () => {
      setIsVideoOn(prev => !prev);
      send('call', { action: 'toggleVideo' });
    }
  };

  // Voice recording handlers
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      setError('Failed to start recording: ' + error.message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      const reader = new FileReader();
      reader.onloadend = () => {
        send('voiceNote', { 
          audioData: reader.result,
          timestamp: new Date().toISOString()
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      setError('Failed to stop recording: ' + error.message);
    }
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [isRecording]);

  // Message handlers
  const toggleVoiceNote = useCallback((id) => {
    setPlayingVoiceNote(playingVoiceNote === id ? null : id);
  }, [playingVoiceNote]);

  const sendMessage = useCallback(() => {
    if (message.trim()) {
      try {
        const newMessage = {
          id: Date.now(),
          text: DOMPurify.sanitize(message),
          sender: 'user', // Replace with actual user ID
          timestamp: new Date().toISOString()
        };
        send('message', newMessage);
        setMessage('');
      } catch (error) {
        setError('Failed to send message: ' + error.message);
      }
    }
  }, [message, send]);

  const addReaction = useCallback((messageId, emoji) => {
    const sanitizedEmoji = DOMPurify.sanitize(emoji);
    const sanitizedMessageId = DOMPurify.sanitize(messageId);
    send('reaction', { messageId: sanitizedMessageId, emoji: sanitizedEmoji });
  }, [send]);

  // Render component
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <Header 
        onlineUsers={onlineUsers}
        notifications={notifications}
        setNotifications={setNotifications}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        isConnected={isConnected}
      />

      <div className="flex h-[calc(100vh-80px)]">
        <AnnotationsPanel />
        <DocumentViewer />
        <ChatPanel 
          messages={messages}
          message={message}
          setMessage={setMessage}
          isInCall={isInCall}
          isVideoCall={isVideoCall}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          playingVoiceNote={playingVoiceNote}
          onlineUsers={onlineUsers}
          chatRef={chatRef}
          callHandlers={callHandlers}
          toggleVoiceNote={toggleVoiceNote}
          addReaction={addReaction}
          sendMessage={sendMessage}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          error={error}
        />
      </div>
    </div>
  );
};

export default AnnotateApp;