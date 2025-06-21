import { UserPreferences } from '@/types';

/**
 * Default user preferences configuration
 * These values are used when a user first signs up or when resetting preferences
 */
export function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'dark',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    notifications: {
      email: true,
      push: true,
      desktop: true,
      mentions: true,
      documentUpdates: true,
      teamMessages: true,
      voiceCalls: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    },
    annotation: {
      defaultTool: 'highlight',
      defaultColor: '#fbbf24',
      strokeWidth: 2,
      fontSize: 14,
      autoSave: true,
      showOtherAnnotations: true,
      realTimeSync: true,
      highlightOpacity: 0.3
    },
    collaboration: {
      showPresence: true,
      allowVoiceCalls: true,
      allowScreenShare: true,
      autoJoinTeamCalls: false,
      shareStatus: true,
      allowDirectMessages: true,
      showTypingIndicators: true
    },
    privacy: {
      profileVisibility: 'team',
      showOnlineStatus: true,
      allowContactByEmail: true,
      dataProcessingConsent: true,
      analyticsOptOut: false,
      shareUsageData: true
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReaderOptimized: false,
      keyboardNavigation: false
    }
  };
}

/**
 * Validates user preferences to ensure they contain valid values
 * @param preferences - The preferences object to validate
 * @returns Validated preferences with fallbacks for invalid values
 */
export function validatePreferences(preferences: Partial<UserPreferences>): UserPreferences {
  const defaults = getDefaultPreferences();
  
  return {
    theme: ['dark', 'light', 'system'].includes(preferences.theme as string) 
      ? preferences.theme as UserPreferences['theme']
      : defaults.theme,
    language: preferences.language || defaults.language,
    timezone: preferences.timezone || defaults.timezone,
    notifications: {
      ...defaults.notifications,
      ...preferences.notifications
    },
    annotation: {
      ...defaults.annotation,
      ...preferences.annotation,
      // Ensure numeric values are within valid ranges
      strokeWidth: Math.max(1, Math.min(10, preferences.annotation?.strokeWidth || defaults.annotation.strokeWidth)),
      fontSize: Math.max(10, Math.min(24, preferences.annotation?.fontSize || defaults.annotation.fontSize)),
      highlightOpacity: Math.max(0.1, Math.min(1, preferences.annotation?.highlightOpacity || defaults.annotation.highlightOpacity))
    },
    collaboration: {
      ...defaults.collaboration,
      ...preferences.collaboration
    },
    privacy: {
      ...defaults.privacy,
      ...preferences.privacy,
      profileVisibility: ['public', 'team', 'private'].includes(preferences.privacy?.profileVisibility as string)
        ? preferences.privacy?.profileVisibility as 'public' | 'team' | 'private'
        : defaults.privacy.profileVisibility
    },
    accessibility: {
      ...defaults.accessibility,
      ...preferences.accessibility,
      fontSize: ['small', 'medium', 'large', 'extra-large'].includes(preferences.accessibility?.fontSize as string)
        ? preferences.accessibility?.fontSize as 'small' | 'medium' | 'large' | 'extra-large'
        : defaults.accessibility.fontSize
    }
  };
}

/**
 * Merges user preferences with defaults, ensuring all required fields are present
 * @param userPreferences - Partial user preferences from storage/API
 * @returns Complete preferences object with defaults filled in
 */
export function mergeWithDefaults(userPreferences: Partial<UserPreferences>): UserPreferences {
  const defaults = getDefaultPreferences();
  
  return {
    ...defaults,
    ...userPreferences,
    notifications: {
      ...defaults.notifications,
      ...userPreferences.notifications,
      quietHours: {
        ...defaults.notifications.quietHours,
        ...userPreferences.notifications?.quietHours
      }
    },
    annotation: {
      ...defaults.annotation,
      ...userPreferences.annotation
    },
    collaboration: {
      ...defaults.collaboration,
      ...userPreferences.collaboration
    },
    privacy: {
      ...defaults.privacy,
      ...userPreferences.privacy
    },
    accessibility: {
      ...defaults.accessibility,
      ...userPreferences.accessibility
    }
  };
}

/**
 * Gets system-detected preferences (theme, timezone, language)
 * @returns Partial preferences based on system settings
 */
export function getSystemPreferences(): Partial<UserPreferences> {
  const systemPreferences: Partial<UserPreferences> = {};
  
  // Detect system theme preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    systemPreferences.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Detect system timezone
  try {
    systemPreferences.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Could not detect system timezone:', error);
  }
  
  // Detect system language
  try {
    const language = navigator.language.split('-')[0];
    if (['en', 'es', 'fr', 'de', 'ja'].includes(language)) {
      systemPreferences.language = language;
    }
  } catch (error) {
    console.warn('Could not detect system language:', error);
  }
  
  // Detect accessibility preferences
  if (typeof window !== 'undefined' && window.matchMedia) {
    systemPreferences.accessibility = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches
    } as any;
  }
  
  return systemPreferences;
}
