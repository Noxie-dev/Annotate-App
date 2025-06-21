import { useState } from 'react';
import { getDefaultPreferences } from '@/lib/preferences';
import { useUserStore } from '@/stores/user-store';
import { UserPreferences, UserPreferencesUpdate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  Palette,
  Globe,
  Brush,
  Users,
  Eye,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';

interface PreferencesPanelProps {
  userId: string;
  preferences?: UserPreferences;
}

export function PreferencesPanel({ userId, preferences }: PreferencesPanelProps) {
  const { updateUserPreferences, isLoading } = useUserStore();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(
    preferences || getDefaultPreferences()
  );
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = (section: keyof UserPreferences, key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const updates: UserPreferencesUpdate = {
        theme: localPreferences.theme,
        language: localPreferences.language,
        timezone: localPreferences.timezone,
        notifications: localPreferences.notifications,
        annotation: localPreferences.annotation,
        collaboration: localPreferences.collaboration,
        privacy: localPreferences.privacy,
        accessibility: localPreferences.accessibility
      };

      await updateUserPreferences(userId, updates);
      setHasChanges(false);

      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save preferences',
        variant: 'destructive'
      });
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences || getDefaultPreferences());
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Save/Reset Actions */}
      {hasChanges && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">You have unsaved changes</p>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Preferences */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Appearance
          </CardTitle>
          <CardDescription className="text-gray-400">
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Theme</Label>
            <Select
              value={localPreferences.theme}
              onValueChange={(value: 'dark' | 'light' | 'system') =>
                updatePreference('theme', 'theme', value)
              }
              aria-label="Theme"
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="dark" className="text-white hover:bg-gray-700">
                  <div className="flex items-center">
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="light" className="text-white hover:bg-gray-700">
                  <div className="flex items-center">
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="system" className="text-white hover:bg-gray-700">
                  <div className="flex items-center">
                    <Laptop className="w-4 h-4 mr-2" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Language
            </Label>
            <Select
              value={localPreferences.language}
              onValueChange={(value) => updatePreference('language', 'language', value)}
              aria-label="Language"
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="en" className="text-white hover:bg-gray-700">English</SelectItem>
                <SelectItem value="es" className="text-white hover:bg-gray-700">Español</SelectItem>
                <SelectItem value="fr" className="text-white hover:bg-gray-700">Français</SelectItem>
                <SelectItem value="de" className="text-white hover:bg-gray-700">Deutsch</SelectItem>
                <SelectItem value="ja" className="text-white hover:bg-gray-700">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Timezone</Label>
            <Select
              value={localPreferences.timezone}
              onValueChange={(value) => updatePreference('timezone', 'timezone', value)}
              aria-label="Timezone"
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="UTC-8" className="text-white hover:bg-gray-700">Pacific Time (UTC-8)</SelectItem>
                <SelectItem value="UTC-5" className="text-white hover:bg-gray-700">Eastern Time (UTC-5)</SelectItem>
                <SelectItem value="UTC+0" className="text-white hover:bg-gray-700">Greenwich Mean Time (UTC+0)</SelectItem>
                <SelectItem value="UTC+1" className="text-white hover:bg-gray-700">Central European Time (UTC+1)</SelectItem>
                <SelectItem value="UTC+9" className="text-white hover:bg-gray-700">Japan Standard Time (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Annotation Preferences */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brush className="w-5 h-5 mr-2" />
            Annotation Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure your annotation tools and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Default Tool</Label>
            <Select
              value={localPreferences.annotation?.defaultTool}
              onValueChange={(value) => updatePreference('annotation', 'defaultTool', value)}
              aria-label="Default Tool"
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="highlight" className="text-white hover:bg-gray-700">Highlight</SelectItem>
                <SelectItem value="comment" className="text-white hover:bg-gray-700">Comment</SelectItem>
                <SelectItem value="shape" className="text-white hover:bg-gray-700">Shape</SelectItem>
                <SelectItem value="freehand" className="text-white hover:bg-gray-700">Freehand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Default Color</Label>
            <div className="flex space-x-2">
              {['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'].map((color, index) => (
                <button
                  key={color}
                  type="button"
                  className={`color-picker-button ${
                    localPreferences.annotation?.defaultColor === color
                      ? 'border-white'
                      : 'border-gray-600'
                  }`}
                  data-color={color}
                  onClick={() => updatePreference('annotation', 'defaultColor', color)}
                  aria-label={`Select color ${index + 1}`}
                  title={`Color option ${index + 1}: ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">
              Stroke Width: {localPreferences.annotation?.strokeWidth}px
            </Label>
            <Slider
              value={[localPreferences.annotation?.strokeWidth || 2]}
              onValueChange={([value]) => updatePreference('annotation', 'strokeWidth', value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">
              Font Size: {localPreferences.annotation?.fontSize}px
            </Label>
            <Slider
              value={[localPreferences.annotation?.fontSize || 14]}
              onValueChange={([value]) => updatePreference('annotation', 'fontSize', value)}
              max={24}
              min={10}
              step={1}
              className="w-full"
            />
          </div>

          <Separator className="bg-gray-700" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Auto Save</Label>
                <p className="text-sm text-gray-400">Automatically save annotations</p>
              </div>
              <Switch
                checked={localPreferences.annotation?.autoSave}
                onCheckedChange={(checked) => updatePreference('annotation', 'autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Show Other Annotations</Label>
                <p className="text-sm text-gray-400">Display annotations from other users</p>
              </div>
              <Switch
                checked={localPreferences.annotation?.showOtherAnnotations}
                onCheckedChange={(checked) => updatePreference('annotation', 'showOtherAnnotations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Real-time Sync</Label>
                <p className="text-sm text-gray-400">Sync annotations in real-time</p>
              </div>
              <Switch
                checked={localPreferences.annotation?.realTimeSync}
                onCheckedChange={(checked) => updatePreference('annotation', 'realTimeSync', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Preferences */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Collaboration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control how you interact with other users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Show Presence</Label>
              <p className="text-sm text-gray-400">Show your cursor to other users</p>
            </div>
            <Switch
              checked={localPreferences.collaboration?.showPresence}
              onCheckedChange={(checked) => updatePreference('collaboration', 'showPresence', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Allow Voice Calls</Label>
              <p className="text-sm text-gray-400">Enable voice calling features</p>
            </div>
            <Switch
              checked={localPreferences.collaboration?.allowVoiceCalls}
              onCheckedChange={(checked) => updatePreference('collaboration', 'allowVoiceCalls', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Allow Screen Share</Label>
              <p className="text-sm text-gray-400">Enable screen sharing capabilities</p>
            </div>
            <Switch
              checked={localPreferences.collaboration?.allowScreenShare}
              onCheckedChange={(checked) => updatePreference('collaboration', 'allowScreenShare', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Show Typing Indicators</Label>
              <p className="text-sm text-gray-400">Show when others are typing</p>
            </div>
            <Switch
              checked={localPreferences.collaboration?.showTypingIndicators}
              onCheckedChange={(checked) => updatePreference('collaboration', 'showTypingIndicators', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Auto-join Team Calls</Label>
              <p className="text-sm text-gray-400">Automatically join team calls when invited</p>
            </div>
            <Switch
              checked={localPreferences.collaboration?.autoJoinTeamCalls}
              onCheckedChange={(checked) => updatePreference('collaboration', 'autoJoinTeamCalls', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Preferences */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Accessibility
          </CardTitle>
          <CardDescription className="text-gray-400">
            Customize accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Font Size</Label>
            <Select
              value={localPreferences.accessibility?.fontSize}
              onValueChange={(value) => updatePreference('accessibility', 'fontSize', value)}
              aria-label="Font Size"
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="small" className="text-white hover:bg-gray-700">Small</SelectItem>
                <SelectItem value="medium" className="text-white hover:bg-gray-700">Medium</SelectItem>
                <SelectItem value="large" className="text-white hover:bg-gray-700">Large</SelectItem>
                <SelectItem value="extra-large" className="text-white hover:bg-gray-700">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">High Contrast</Label>
              <p className="text-sm text-gray-400">Increase contrast for better visibility</p>
            </div>
            <Switch
              checked={localPreferences.accessibility?.highContrast}
              onCheckedChange={(checked) => updatePreference('accessibility', 'highContrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Reduced Motion</Label>
              <p className="text-sm text-gray-400">Minimize animations and transitions</p>
            </div>
            <Switch
              checked={localPreferences.accessibility?.reducedMotion}
              onCheckedChange={(checked) => updatePreference('accessibility', 'reducedMotion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Keyboard Navigation</Label>
              <p className="text-sm text-gray-400">Enhanced keyboard navigation support</p>
            </div>
            <Switch
              checked={localPreferences.accessibility?.keyboardNavigation}
              onCheckedChange={(checked) => updatePreference('accessibility', 'keyboardNavigation', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
