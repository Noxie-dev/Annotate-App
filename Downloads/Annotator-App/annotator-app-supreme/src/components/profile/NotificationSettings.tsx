import React from 'react';
import { Mail, Smartphone, Monitor, AtSign, FileText, MessageCircle, Phone, LucideIcon } from 'lucide-react';
import { User } from '@/types';
import { useUserStore } from '@/stores/user-store';
import { Switch } from '@/components/ui/switch';

interface NotificationSettingsProps {
  user: User;
}

// Define a type for the settings items to avoid repetition
type NotificationSettingItem = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
  const { updateUserPreferences, isLoading } = useUserStore();

  // Early return if user is not provided
  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 dark:text-gray-400">User information not available</p>
      </div>
    );
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    // Ensure we start with the existing preferences or an empty object
    const currentPreferences = user.preferences || {};
    const currentNotifications = (currentPreferences as any).notifications || {};

    const preferences = {
      ...currentPreferences,
      notifications: {
        ...currentNotifications,
        [key]: value
      }
    };

    await updateUserPreferences(user.id, preferences);
  };

  const notificationChannels: NotificationSettingItem[] = [
    {
      key: 'email',
      label: 'Email notifications',
      description: 'Receive notifications via email',
      icon: Mail
    },
    {
      key: 'push',
      label: 'Push notifications',
      description: 'Receive push notifications on mobile devices',
      icon: Smartphone
    },
    {
      key: 'desktop',
      label: 'Desktop notifications',
      description: 'Show desktop notifications when using the web app',
      icon: Monitor
    }
  ];

  const notificationTypes: NotificationSettingItem[] = [
    {
      key: 'mentions',
      label: 'Mentions',
      description: 'When someone @mentions you in comments or chats',
      icon: AtSign
    },
    {
      key: 'documentUpdates',
      label: 'Document updates',
      description: 'When documents you\'re watching are modified',
      icon: FileText
    },
    {
      key: 'teamMessages',
      label: 'Team messages',
      description: 'New messages in team channels you belong to',
      icon: MessageCircle
    },
    {
      key: 'voiceCalls',
      label: 'Voice calls',
      description: 'Incoming voice and video calls',
      icon: Phone
    }
  ];

  // Helper component to render a list of settings to keep the code DRY
  const renderSettingsList = (settings: NotificationSettingItem[]) => (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {settings.map((setting) => {
        const Icon = setting.icon;
        // Safely access nested preference, defaulting to false if not set
        const isChecked = user.preferences?.notifications?.[setting.key] ?? false;

        return (
          <li key={setting.key} className="flex items-center justify-between py-4 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{setting.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
              </div>
            </div>
            <Switch
              id={`toggle-${setting.key}`}
              checked={isChecked}
              onCheckedChange={(checked) => handleNotificationChange(setting.key, checked)}
              disabled={isLoading}
              aria-label={`Toggle ${setting.label}`}
            />
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
          By Channel
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          {renderSettingsList(notificationChannels)}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
          By Type
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          {renderSettingsList(notificationTypes)}
        </div>
      </div>
    </div>
  );

};
