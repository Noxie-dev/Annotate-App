# WebRTC Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
All required dependencies are already installed:
- `webrtc-adapter` - Cross-browser compatibility
- `@tanstack/react-query` - Server state management
- `socket.io-client` - WebSocket signaling

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Video Calling

#### Option A: Multiple Browser Tabs
1. Open the app in 2 browser tabs
2. Navigate to a document with the chat panel
3. Click the video call button in the chat header
4. Accept the call in the other tab

#### Option B: Different Browsers
1. Open the app in Chrome and Firefox
2. Test cross-browser compatibility
3. Verify audio/video functionality

## 🎯 Key Components

### Using the Video Call System

```tsx
import { VideoCall } from '@/components/communication/VideoCall';
import { useWebRTC } from '@/hooks/use-webrtc';

function MyComponent() {
  const { initiateCall, isInCall } = useWebRTC();
  
  const startCall = () => {
    initiateCall('target-user-id');
  };
  
  return (
    <div>
      <button onClick={startCall}>Start Video Call</button>
      {isInCall && <VideoCall isOpen={true} onClose={() => {}} />}
    </div>
  );
}
```

### WebRTC Hook Usage

```tsx
const {
  // State
  isInCall,
  isInitiating,
  isReceivingCall,
  localStream,
  remoteStreams,
  participants,
  isVideoEnabled,
  isAudioEnabled,
  isSharingScreen,
  
  // Actions
  initiateCall,
  acceptIncomingCall,
  rejectIncomingCall,
  endCall,
  toggleVideo,
  toggleAudio,
  toggleScreenShare
} = useWebRTC({
  onCallReceived: (callId, fromUserId) => {
    // Handle incoming call
  },
  onCallEnded: () => {
    // Handle call end
  },
  onError: (error) => {
    // Handle errors
  }
});
```

## 🔧 Configuration

### Basic Configuration
The system works out of the box with Google's STUN servers. No additional configuration needed for development.

### Production Configuration
For production, add TURN servers in `.env`:

```env
REACT_APP_SIGNALING_SERVER_URL=wss://your-signaling-server.com
REACT_APP_TURN_USERNAME=your-turn-username
REACT_APP_TURN_PASSWORD=your-turn-password
```

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Start video call
- [ ] Accept incoming call
- [ ] Reject incoming call
- [ ] End active call
- [ ] Toggle video on/off
- [ ] Toggle audio on/off
- [ ] Share screen
- [ ] Open media settings

### Error Scenarios
- [ ] Deny camera permission
- [ ] Deny microphone permission
- [ ] Disconnect camera during call
- [ ] Test with no internet connection

### Browser Compatibility
- [ ] Chrome (recommended)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🐛 Common Issues

### "Permission denied" Error
**Solution**: Allow camera/microphone access in browser settings

### "Connection failed" Error
**Solution**: Check internet connection and firewall settings

### No Video/Audio
**Solution**: Verify devices are connected and not in use by other apps

### Debug Tools
Access the WebRTC debugger in development mode via the settings menu in video controls.

## 📱 Mobile Testing

### iOS Safari
- Requires user gesture to start media
- Limited screen sharing support
- Test on actual device, not simulator

### Android Chrome
- Full WebRTC support
- Test with different Android versions
- Verify permissions work correctly

## 🔄 Integration Points

### Chat Panel Integration
The video call system is integrated into the existing ChatPanel component:
- Video call button in chat header
- Call status indicators
- Seamless transition between chat and video

### Document Store Integration
Uses existing user management and presence system:
- User avatars and names
- Online status indicators
- Participant management

## 📊 Performance Tips

### Optimize for Low Bandwidth
```tsx
// Use audio-only mode
const { toggleVideo } = useWebRTC();
toggleVideo(); // Disable video to save bandwidth
```

### Adjust Video Quality
Access media settings to change video resolution:
- 480p for low bandwidth
- 720p for standard quality
- 1080p for high quality

## 🚀 Deployment

### Signaling Server
You'll need a signaling server for production. See the main implementation guide for a complete Node.js example.

### HTTPS Requirement
WebRTC requires HTTPS in production. Ensure your app is served over HTTPS.

### CORS Configuration
Configure CORS on your signaling server to allow your domain.

## 📚 Next Steps

1. **Set up signaling server** for production use
2. **Configure TURN servers** for better connectivity
3. **Add recording functionality** if needed
4. **Implement call history** and analytics
5. **Add mobile app support** with React Native

## 🆘 Getting Help

1. **Check the debugger** - Use the built-in WebRTC debugger
2. **Review console logs** - Look for WebRTC-specific errors
3. **Test different browsers** - Verify cross-browser compatibility
4. **Check network conditions** - Test on different networks

---

**Status**: ✅ Ready for Development and Testing

The WebRTC system is fully implemented and ready for use. Start with the basic testing checklist and gradually explore advanced features.
