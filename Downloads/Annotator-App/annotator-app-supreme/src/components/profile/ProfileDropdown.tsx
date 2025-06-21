import { useState, Suspense } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { UserProfile } from './UserProfile';

export function ProfileDropdown() {
  const { currentUser } = useUserStore();
  const { logout, isAuthenticated } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleProfileClick = (tab: string = 'profile') => {
    setProfileTab(tab);
    setShowProfile(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-auto px-2 hover:bg-gray-800"
          >
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(currentUser.status)}`} 
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white truncate max-w-32">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-32">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 bg-gray-900 border-gray-700" 
          align="end" 
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-600 text-white text-xs"
                >
                  {currentUser.role}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 text-xs"
                >
                  {currentUser.status}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-gray-700" />
          
          <DropdownMenuItem 
            onClick={() => handleProfileClick('profile')}
            className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleProfileClick('preferences')}
            className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Preferences</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleProfileClick('notifications')}
            className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleProfileClick('security')}
            className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-gray-700" />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 p-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-700">
            <DialogTitle className="text-white">User Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your profile, preferences, and security settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 overflow-y-auto">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              }
            >
              <UserProfile 
                userId={currentUser.id} 
                isOwnProfile={true}
                defaultTab={profileTab}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
