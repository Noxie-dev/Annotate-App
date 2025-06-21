import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  Mic,
  Video,
  Monitor,
  Volume2,
  TestTube,
  Wifi,
  Info
} from 'lucide-react';

interface MediaSettingsProps {
  isInCall?: boolean;
}

export function MediaSettings({ isInCall = false }: MediaSettingsProps) {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');
  const [micVolume, setMicVolume] = useState([75]);
  const [speakerVolume, setSpeakerVolume] = useState([75]);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingCamera, setIsTestingCamera] = useState(false);

  // Load available media devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        setAudioDevices(devices.filter(device => 
          device.kind === 'audioinput' || device.kind === 'audiooutput'
        ));
        setVideoDevices(devices.filter(device => device.kind === 'videoinput'));

        // Set default devices
        const defaultAudioInput = devices.find(d => d.kind === 'audioinput' && d.deviceId === 'default');
        const defaultAudioOutput = devices.find(d => d.kind === 'audiooutput' && d.deviceId === 'default');
        const defaultVideoInput = devices.find(d => d.kind === 'videoinput' && d.deviceId === 'default');

        if (defaultAudioInput) setSelectedAudioInput(defaultAudioInput.deviceId);
        if (defaultAudioOutput) setSelectedAudioOutput(defaultAudioOutput.deviceId);
        if (defaultVideoInput) setSelectedVideoInput(defaultVideoInput.deviceId);
      } catch (error) {
        console.error('Failed to load media devices:', error);
      }
    };

    loadDevices();
  }, []);

  const testMicrophone = async () => {
    setIsTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl
        }
      });

      // Create audio context for volume monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      // Monitor for 3 seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        setIsTestingMic(false);
      }, 3000);
    } catch (error) {
      console.error('Microphone test failed:', error);
      setIsTestingMic(false);
    }
  };

  const testCamera = async () => {
    setIsTestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedVideoInput ? { exact: selectedVideoInput } : undefined,
          width: { ideal: videoQuality === '1080p' ? 1920 : videoQuality === '720p' ? 1280 : 640 },
          height: { ideal: videoQuality === '1080p' ? 1080 : videoQuality === '720p' ? 720 : 480 }
        }
      });

      // Stop after 3 seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setIsTestingCamera(false);
      }, 3000);
    } catch (error) {
      console.error('Camera test failed:', error);
      setIsTestingCamera(false);
    }
  };

  const getVideoQualityDescription = (quality: string) => {
    switch (quality) {
      case '1080p': return 'High quality (1920x1080) - Uses more bandwidth';
      case '720p': return 'Standard quality (1280x720) - Recommended';
      case '480p': return 'Low quality (640x480) - Uses less bandwidth';
      default: return '';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Media Settings</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your audio and video settings for the best call experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="audio" className="data-[state=active]:bg-gray-700">
              <Mic className="w-4 h-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-gray-700">
              <Video className="w-4 h-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-gray-700">
              <Monitor className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-200">Microphone</Label>
                <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {audioDevices.filter(d => d.kind === 'audioinput').map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Speakers</Label>
                <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select speakers" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {audioDevices.filter(d => d.kind === 'audiooutput').map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Microphone Volume</Label>
                <Slider
                  value={micVolume}
                  onValueChange={setMicVolume}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-400 mt-1">{micVolume[0]}%</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Speaker Volume</Label>
                <Slider
                  value={speakerVolume}
                  onValueChange={setSpeakerVolume}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-400 mt-1">{speakerVolume[0]}%</div>
              </div>

              <Button
                onClick={testMicrophone}
                disabled={isTestingMic}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isTestingMic ? 'Testing Microphone...' : 'Test Microphone'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-200">Camera</Label>
                <Select value={selectedVideoInput} onValueChange={setSelectedVideoInput}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {videoDevices.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Video Quality</Label>
                <Select value={videoQuality} onValueChange={setVideoQuality}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="1080p">1080p (High)</SelectItem>
                    <SelectItem value="720p">720p (Standard)</SelectItem>
                    <SelectItem value="480p">480p (Low)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-400 mt-1">
                  {getVideoQualityDescription(videoQuality)}
                </div>
              </div>

              <Button
                onClick={testCamera}
                disabled={isTestingCamera}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isTestingCamera ? 'Testing Camera...' : 'Test Camera'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-200">Echo Cancellation</Label>
                  <p className="text-xs text-gray-400">Reduces echo from speakers</p>
                </div>
                <Switch
                  checked={echoCancellation}
                  onCheckedChange={setEchoCancellation}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-200">Noise Suppression</Label>
                  <p className="text-xs text-gray-400">Reduces background noise</p>
                </div>
                <Switch
                  checked={noiseSuppression}
                  onCheckedChange={setNoiseSuppression}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-200">Auto Gain Control</Label>
                  <p className="text-xs text-gray-400">Automatically adjusts microphone volume</p>
                </div>
                <Switch
                  checked={autoGainControl}
                  onCheckedChange={setAutoGainControl}
                />
              </div>

              {isInCall && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">Call Information</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>Connection: WebRTC P2P</div>
                    <div>Audio Codec: Opus</div>
                    <div>Video Codec: VP8/H.264</div>
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-3 h-3" />
                      <span>Connection Quality: Good</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
