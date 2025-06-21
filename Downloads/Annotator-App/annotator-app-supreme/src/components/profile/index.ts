// Lazy-loaded profile components for code splitting
import { lazy } from 'react';

// Main profile component
export const UserProfile = lazy(() => 
  import('./UserProfile').then(module => ({ default: module.UserProfile }))
);

// Profile edit form
export const ProfileEditForm = lazy(() => 
  import('./ProfileEditForm').then(module => ({ default: module.ProfileEditForm }))
);

// Profile tabs component
export const ProfileTabs = lazy(() =>
  import('./ProfileTabs').then(module => ({ default: module.ProfileTabs }))
);

// Preferences panel
export const PreferencesPanel = lazy(() =>
  import('./PreferencesPanel').then(module => ({ default: module.PreferencesPanel }))
);

// Notification settings
export const NotificationSettings = lazy(() => 
  import('./NotificationSettings').then(module => ({ default: module.NotificationSettings }))
);

// Security panel
export const SecurityPanel = lazy(() => 
  import('./SecurityPanel').then(module => ({ default: module.SecurityPanel }))
);

// Profile dropdown for header
export const ProfileDropdown = lazy(() => 
  import('./ProfileDropdown').then(module => ({ default: module.ProfileDropdown }))
);

// Export types for convenience
export type { UserProfileProps } from './UserProfile';
