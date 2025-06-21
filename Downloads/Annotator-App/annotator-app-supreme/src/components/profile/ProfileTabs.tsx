import React, { useState } from 'react';
import { Settings, Bell, Palette, Shield, Users, Activity, User as UserIcon, Calendar } from 'lucide-react';
import { User, PrivacyPreferences } from '@/types';
import { useUserStore } from '@/stores/user-store';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PreferencesPanel } from './PreferencesPanel';
import { NotificationSettings } from './NotificationSettings';
import './ProfileTabs.css';

interface ProfileTabsProps {
  user: User;
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'annotation', label: 'Annotation', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'activity', label: 'Activity', icon: Activity },
];

// Helper function to get CSS class name for color
const getColorClassName = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#fbbf24': 'color-amber',
    '#ef4444': 'color-red',
    '#10b981': 'color-emerald',
    '#3b82f6': 'color-blue',
    '#8b5cf6': 'color-violet',
    '#f59e0b': 'color-orange'
  };
  return colorMap[color] || '';
};

// Annotation Settings Component
const AnnotationSettings: React.FC<{ user: User }> = ({ user }) => {
  const { updateUserPreferences, isLoading } = useUserStore();
  const [preferences, setPreferences] = useState(user.preferences?.annotation || {
    defaultTool: 'highlight' as const,
    defaultColor: '#fbbf24',
    strokeWidth: 2,
    fontSize: 14,
    autoSave: true,
    showOtherAnnotations: true,
    realTimeSync: true,
    highlightOpacity: 0.3
  });
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateUserPreferences(user.id, {
        annotation: preferences
      });
      setHasChanges(false);
      toast({
        title: 'Annotation settings saved',
        description: 'Your annotation preferences have been updated'
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save annotation settings',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {hasChanges && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">You have unsaved changes</p>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Annotation Preferences
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure your default annotation tools and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Default Tool</label>
              <select
                value={preferences.defaultTool}
                onChange={(e) => updatePreference('defaultTool', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                aria-label="Default annotation tool"
              >
                <option value="highlight">Highlight</option>
                <option value="comment">Comment</option>
                <option value="shape">Shape</option>
                <option value="freehand">Freehand</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Default Color</label>
              <div className="flex space-x-2">
                {['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 color-picker-button ${getColorClassName(color)} ${
                      preferences.defaultColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                    onClick={() => updatePreference('defaultColor', color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Stroke Width: {preferences.strokeWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={preferences.strokeWidth}
                onChange={(e) => updatePreference('strokeWidth', parseInt(e.target.value))}
                className="w-full"
                aria-label={`Stroke width: ${preferences.strokeWidth} pixels`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Font Size: {preferences.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={preferences.fontSize}
                onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
                className="w-full"
                aria-label={`Font size: ${preferences.fontSize} pixels`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Highlight Opacity: {Math.round(preferences.highlightOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={preferences.highlightOpacity}
                onChange={(e) => updatePreference('highlightOpacity', parseFloat(e.target.value))}
                className="w-full"
                aria-label={`Highlight opacity: ${Math.round(preferences.highlightOpacity * 100)} percent`}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Auto Save</label>
                <p className="text-xs text-gray-400">Automatically save annotations as you create them</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => updatePreference('autoSave', e.target.checked)}
                className="w-4 h-4"
                aria-label="Auto Save - Automatically save annotations as you create them"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Show Other Annotations</label>
                <p className="text-xs text-gray-400">Display annotations from other users</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showOtherAnnotations}
                onChange={(e) => updatePreference('showOtherAnnotations', e.target.checked)}
                className="w-4 h-4"
                aria-label="Show Other Annotations - Display annotations from other users"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Real-time Sync</label>
                <p className="text-xs text-gray-400">Sync annotations in real-time with other users</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.realTimeSync}
                onChange={(e) => updatePreference('realTimeSync', e.target.checked)}
                className="w-4 h-4"
                aria-label="Real-time Sync - Sync annotations in real-time with other users"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PrivacySettings: React.FC<{ user: User }> = ({ user }) => {
  const { updateUserPreferences, isLoading } = useUserStore();
  const [preferences, setPreferences] = useState<PrivacyPreferences>(user.preferences?.privacy || {
    profileVisibility: 'team',
    showOnlineStatus: true,
    allowContactByEmail: true,
    dataProcessingConsent: true,
    analyticsOptOut: false,
    shareUsageData: true
  });
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateUserPreferences(user.id, {
        privacy: preferences
      });
      setHasChanges(false);
      toast({
        title: 'Privacy settings saved',
        description: 'Your privacy preferences have been updated'
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save privacy settings',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {hasChanges && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">You have unsaved changes</p>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy & Visibility
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control who can see your information and how your data is used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Profile Visibility</label>
            <select
              value={preferences.profileVisibility}
              onChange={(e) => updatePreference('profileVisibility', e.target.value as 'public' | 'team' | 'private')}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              aria-label="Profile visibility setting"
            >
              <option value="public">Public - Anyone can see your profile</option>
              <option value="team">Team Only - Only team members can see your profile</option>
              <option value="private">Private - Only you can see your profile</option>
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Show Online Status</label>
                <p className="text-xs text-gray-400">Let others see when you're online</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showOnlineStatus}
                onChange={(e) => updatePreference('showOnlineStatus', e.target.checked)}
                className="w-4 h-4"
                aria-label="Show Online Status - Let others see when you're online"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Allow Contact by Email</label>
                <p className="text-xs text-gray-400">Allow team members to contact you via email</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.allowContactByEmail}
                onChange={(e) => updatePreference('allowContactByEmail', e.target.checked)}
                className="w-4 h-4"
                aria-label="Allow Contact by Email - Allow team members to contact you via email"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Data Processing Consent</label>
                <p className="text-xs text-gray-400">Allow processing of your data for service improvement</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.dataProcessingConsent}
                onChange={(e) => updatePreference('dataProcessingConsent', e.target.checked)}
                className="w-4 h-4"
                aria-label="Data Processing Consent - Allow processing of your data for service improvement"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Analytics Opt-out</label>
                <p className="text-xs text-gray-400">Opt out of analytics data collection</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analyticsOptOut}
                onChange={(e) => updatePreference('analyticsOptOut', e.target.checked)}
                className="w-4 h-4"
                aria-label="Analytics Opt-out - Opt out of analytics data collection"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Share Usage Data</label>
                <p className="text-xs text-gray-400">Help improve the app by sharing anonymous usage data</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.shareUsageData}
                onChange={(e) => updatePreference('shareUsageData', e.target.checked)}
                className="w-4 h-4"
                aria-label="Share Usage Data - Help improve the app by sharing anonymous usage data"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ActivityLog: React.FC<{ user: User }> = ({ user: _user }) => {
  // Mock activity data - in a real app, this would come from an API
  const activities = [
    {
      id: '1',
      type: 'login',
      description: 'Signed in to the application',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: UserIcon,
      color: 'text-green-500'
    },
    {
      id: '2',
      type: 'annotation',
      description: 'Added annotation to "Project Proposal.pdf"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: Palette,
      color: 'text-blue-500'
    },
    {
      id: '3',
      type: 'profile',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Settings,
      color: 'text-purple-500'
    },
    {
      id: '4',
      type: 'team',
      description: 'Joined "Product Development" team',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Users,
      color: 'text-orange-500'
    },
    {
      id: '5',
      type: 'security',
      description: 'Enabled two-factor authentication',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Shield,
      color: 'text-red-500'
    }
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your recent actions and account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                  <div className={`p-2 rounded-full bg-gray-600 ${activity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.description}</p>
                    <p className="text-gray-400 text-sm mt-1">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                    {activity.type}
                  </Badge>
                </div>
              );
            })}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Activity Statistics</CardTitle>
          <CardDescription className="text-gray-400">
            Overview of your account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">24</div>
              <div className="text-sm text-gray-400">Annotations</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-sm text-gray-400">Documents</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">Teams</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">48h</div>
              <div className="text-sm text-gray-400">Active Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ user }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <Tabs defaultValue="profile" className="w-full">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-b border-gray-700 rounded-none h-auto p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center px-4 py-4 whitespace-nowrap border-b-2 border-transparent transition-colors data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 data-[state=active]:bg-gray-750 text-gray-400 hover:text-gray-300 hover:bg-gray-750 rounded-none"
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="profile" className="p-6 mt-0">
          <div className="space-y-6">
            <ProfileDetailsCard user={user} />
            <TeamAffiliationsCard user={user} />
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="p-6 mt-0">
          <PreferencesPanel userId={user.id} preferences={user.preferences} />
        </TabsContent>

        <TabsContent value="notifications" className="p-6 mt-0">
          <NotificationSettings user={user} />
        </TabsContent>

        <TabsContent value="annotation" className="p-6 mt-0">
          <AnnotationSettings user={user} />
        </TabsContent>

        <TabsContent value="privacy" className="p-6 mt-0">
          <PrivacySettings user={user} />
        </TabsContent>

        <TabsContent value="activity" className="p-6 mt-0">
          <ActivityLog user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Profile Details Card Component
function ProfileDetailsCard({ user }: { user: any }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Profile Details
        </CardTitle>
        <CardDescription className="text-gray-400">
          Personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{user.name}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{user.email}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Phone</label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{user.phone || 'Not provided'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Department</label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{user.department || 'Not specified'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Timezone</label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{user.timezone || 'Not specified'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Member Since</label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{formatDate(user.joinDate)}</p>
          </div>
        </div>

        {user.bio && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bio</label>
            <div className="text-white bg-gray-700 px-3 py-2 rounded-lg leading-relaxed">
              {user.bio}
            </div>
          </div>
        )}

        {/* Status and Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Current Status</label>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                user.status === 'online' ? 'bg-green-500' :
                user.status === 'away' ? 'bg-yellow-500' :
                user.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="text-white capitalize">{user.status}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Last Active</label>
            <p className="text-white">{formatDate(user.lastLoginAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Team Affiliations Card Component
function TeamAffiliationsCard({ user }: { user: any }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user.teamAffiliations || user.teamAffiliations.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Affiliations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Teams and roles you're part of
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No team affiliations found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Team Affiliations
        </CardTitle>
        <CardDescription className="text-gray-400">
          Teams and roles you're part of
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user.teamAffiliations.map((affiliation: any) => (
            <div key={affiliation.teamId} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white text-lg">{affiliation.teamName}</h4>
                <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                  {affiliation.role}
                </Badge>
              </div>

              <p className="text-sm text-gray-400 mb-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {formatDate(affiliation.joinedAt)}
              </p>

              {affiliation.permissions && affiliation.permissions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Permissions</h5>
                  <div className="flex flex-wrap gap-2">
                    {affiliation.permissions.map((permission: any) => (
                      <Badge
                        key={permission.id}
                        variant={permission.enabled ? "default" : "secondary"}
                        className={`text-xs ${
                          permission.enabled
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-600 hover:bg-gray-700 text-gray-300"
                        }`}
                        title={permission.description}
                      >
                        {permission.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
