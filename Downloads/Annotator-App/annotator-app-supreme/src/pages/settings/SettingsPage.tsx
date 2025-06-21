import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Navigate, Link } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  ArrowLeft,
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const settingsCategories = [
    {
      id: 'profile',
      title: 'Profile & Account',
      description: 'Manage your personal information and account settings',
      icon: User,
      href: '/profile',
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Password, two-factor authentication, and privacy settings',
      icon: Shield,
      href: '/profile?tab=security',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email, push, and in-app notification preferences',
      icon: Bell,
      href: '/profile?tab=notifications',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme, language, and display preferences',
      icon: Palette,
      href: '/profile?tab=preferences',
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      description: 'Team settings, sharing, and collaboration preferences',
      icon: Globe,
      href: '/profile?tab=collaboration',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <div className="border-b border-gray-700 bg-[#1a1f2e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center">
                <Settings className="w-6 h-6 text-gray-400 mr-3" />
                <h1 className="text-xl font-semibold text-gray-200">Settings</h1>
              </div>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gray-600 text-gray-200">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="bg-[#1a1f2e] border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gray-600 text-gray-200 text-xl">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-200">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                  >
                    {user?.role.name}
                  </Badge>
                  {user?.mfaEnabled && (
                    <Badge 
                      variant="secondary" 
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      2FA Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Settings Categories</h3>
          
          {settingsCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} to={category.href}>
                <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#0f1419] rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-200">
                            {category.title}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-[#1a1f2e] border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-gray-200">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Common settings and account actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/profile?tab=security">
                <Button 
                  variant="outline" 
                  className="w-full bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </Link>
              
              <Link to="/profile?tab=security">
                <Button 
                  variant="outline" 
                  className="w-full bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {user?.mfaEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </Button>
              </Link>
              
              <Link to="/profile?tab=notifications">
                <Button 
                  variant="outline" 
                  className="w-full bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button 
                  variant="outline" 
                  className="w-full bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
