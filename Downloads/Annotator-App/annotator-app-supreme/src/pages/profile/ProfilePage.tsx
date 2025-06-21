import { useAuth } from '@/hooks/use-auth';
import { UserProfile } from '@/components/profile/UserProfile';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Navigate } from 'react-router-dom';

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <UserProfile 
      userId={user?.id} 
      isOwnProfile={true} 
      defaultTab="profile" 
    />
  );
}
