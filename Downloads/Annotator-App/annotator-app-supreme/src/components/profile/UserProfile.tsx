import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  User,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Camera,
  Edit2,
  Loader2
} from 'lucide-react';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileTabs } from './ProfileTabs';

export interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
  defaultTab?: string;
}

export function UserProfile({ userId, isOwnProfile = true, defaultTab = 'profile' }: UserProfileProps) {
  const { currentUser, isLoading, error, fetchUser } = useUserStore();
  const { isAuthenticated } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userId && userId !== currentUser?.id) {
      fetchUser(userId);
    }
  }, [userId, currentUser?.id, fetchUser]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">Please log in to view profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => fetchUser(userId || currentUser?.id || '')}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProfileHeader
          user={currentUser}
          isOwnProfile={isOwnProfile}
          onEditProfile={() => setIsEditing(true)}
        />
        <ProfileTabs user={currentUser} />
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <ProfileEditForm
          user={currentUser}
          onClose={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// Enhanced ProfileHeader Component
interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

function ProfileHeader({ user, isOwnProfile, onEditProfile }: ProfileHeaderProps) {
  const { updateUserProfile, uploadAvatar, isLoading } = useUserStore();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user.bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const newAvatarUrl = await uploadAvatar(file);
        await updateUserProfile(user.id, { avatar: newAvatarUrl });
        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated successfully'
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Failed to upload avatar',
          variant: 'destructive'
        });
      }
    }
  };

  const handleBioSave = async () => {
    try {
      await updateUserProfile(user.id, { bio });
      setIsEditingBio(false);
      toast({
        title: 'Bio updated',
        description: 'Your bio has been updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update bio',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
              <Avatar className="w-full h-full">
                <AvatarImage src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl w-full h-full">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 rounded-full p-2 text-white transition-colors disabled:opacity-50"
                aria-label="Upload new avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              aria-label="Avatar upload input"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-gray-300 text-lg">{user.role}</p>
                {user.department && (
                  <p className="text-gray-400">{user.department}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditProfile}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <a href={`mailto:${user.email}`} className="hover:text-blue-400 transition-colors">
                  {user.email}
                </a>
              </div>
              {user.phone && (
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`tel:${user.phone}`} className="hover:text-blue-400 transition-colors">
                    {user.phone}
                  </a>
                </div>
              )}
              {user.timezone && (
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{user.timezone}</span>
                </div>
              )}
              {user.joinDate && (
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Joined {formatDate(user.joinDate)}</span>
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">About</h3>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Edit bio"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="space-y-3">
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleBioSave} size="sm" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBio(user.bio || '');
                        setIsEditingBio(false);
                      }}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {user.bio || 'No bio available.'}
                </p>
              )}
            </div>

            {/* Team Affiliations */}
            {user.teamAffiliations && user.teamAffiliations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Team Affiliations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.teamAffiliations.map((team: any) => (
                    <div
                      key={team.teamId}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300"
                    >
                      {team.teamName} - {team.role}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



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
          <User className="w-5 h-5 mr-2" />
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
