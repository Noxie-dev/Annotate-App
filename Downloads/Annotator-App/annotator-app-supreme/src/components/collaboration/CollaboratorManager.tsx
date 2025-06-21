import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreHorizontal, 
  Crown, 
  Eye, 
  MessageSquare, 
  Edit, 
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { 
  collaborationService, 
  DocumentCollaborator, 
  CollaboratorInvite, 
  CollaboratorPermission 
} from '@/services/collaboration-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Utility function for permission icons
const getPermissionIcon = (permission: CollaboratorPermission) => {
  switch (permission) {
    case 'view': return <Eye className="w-4 h-4" />;
    case 'comment': return <MessageSquare className="w-4 h-4" />;
    case 'edit': return <Edit className="w-4 h-4" />;
    case 'admin': return <Crown className="w-4 h-4" />;
    default: return <Eye className="w-4 h-4" />;
  }
};

interface CollaboratorManagerProps {
  documentId: string;
  currentUserPermission: CollaboratorPermission;
}

export function CollaboratorManager({ documentId, currentUserPermission }: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CollaboratorInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    loadCollaborators();
    loadPendingInvites();
  }, [documentId]);

  const loadCollaborators = async () => {
    try {
      const data = await collaborationService.getDocumentCollaborators(documentId);
      setCollaborators(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const data = await collaborationService.getPendingInvitations(documentId);
      setPendingInvites(data);
    } catch (err: any) {
      console.error('Failed to load pending invites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (collaboratorId: string, permission: CollaboratorPermission) => {
    try {
      await collaborationService.updateCollaboratorPermission(documentId, collaboratorId, permission);
      setCollaborators(prev => prev.map(c => 
        c.id === collaboratorId ? { ...c, permission } : c
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      await collaborationService.removeCollaborator(documentId, collaboratorId);
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await collaborationService.cancelInvitation(inviteId);
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const canManageCollaborators = collaborationService.hasCapability(
    currentUserPermission, 
    'manage_collaborators'
  );

  const formatLastActive = (lastActiveAt: string) => {
    const date = new Date(lastActiveAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };


  if (isLoading) {
    return (
      <Card className="bg-[#1a1f2e] border-gray-700">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading collaborators...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[#1a1f2e] border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-200 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Collaborators ({collaborators.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage document access and permissions
              </CardDescription>
            </div>
            {canManageCollaborators && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="bg-red-900/20 border-red-800 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0f1419]">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-[#1a1f2e] data-[state=active]:text-gray-200"
              >
                Active ({collaborators.length})
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-[#1a1f2e] data-[state=active]:text-gray-200"
              >
                Pending ({pendingInvites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {collaborators.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No collaborators yet</p>
                </div>
              ) : (
                collaborators.map((collaborator) => {
                  const permissionLevel = collaborationService.getPermissionLevel(collaborator.permission);
                  
                  return (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={collaborator.user.avatar} />
                          <AvatarFallback className="bg-gray-600 text-gray-200">
                            {collaborator.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-gray-200 font-medium">
                              {collaborator.user.name}
                            </h4>
                            <Badge className={permissionLevel.color}>
                              {getPermissionIcon(collaborator.permission)}
                              <span className="ml-1">{permissionLevel.name}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{collaborator.user.email}</span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatLastActive(collaborator.lastActiveAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {canManageCollaborators && collaborator.permission !== 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1a1f2e] border-gray-600">
                            <DropdownMenuItem 
                              onClick={() => handleUpdatePermission(collaborator.id, 'view')}
                              className="text-gray-300 hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Set as Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdatePermission(collaborator.id, 'comment')}
                              className="text-gray-300 hover:bg-gray-700"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Set as Commenter
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdatePermission(collaborator.id, 'edit')}
                              className="text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Set as Editor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-600" />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveCollaborator(collaborator.id)}
                              className="text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pendingInvites.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No pending invitations</p>
                </div>
              ) : (
                pendingInvites.map((invite) => {
                  const permissionLevel = collaborationService.getPermissionLevel(invite.permission);
                  
                  return (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-gray-200 font-medium">
                              {invite.email}
                            </h4>
                            <Badge className={permissionLevel.color}>
                              {getPermissionIcon(invite.permission)}
                              <span className="ml-1">{permissionLevel.name}</span>
                            </Badge>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Pending
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            Invited {formatLastActive(invite.invitedAt)}
                          </div>
                        </div>
                      </div>
                      
                      {canManageCollaborators && (
                        <Button
                          onClick={() => handleCancelInvite(invite.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteCollaboratorsDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        documentId={documentId}
        onInvitesSent={(newInvites) => {
          setPendingInvites(prev => [...prev, ...newInvites]);
        }}
      />
    </>
  );
}

// Invite Collaborators Dialog Component
interface InviteCollaboratorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  onInvitesSent: (invites: CollaboratorInvite[]) => void;
}

function InviteCollaboratorsDialog({ 
  open, 
  onOpenChange, 
  documentId, 
  onInvitesSent 
}: InviteCollaboratorsDialogProps) {
  const [emails, setEmails] = useState('');
  const [permission, setPermission] = useState<CollaboratorPermission>('comment');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailList = emails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && /\S+@\S+\.\S+/.test(email));

    if (emailList.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const invites = emailList.map(email => ({
        email,
        permission,
        message: message.trim() || undefined
      }));

      const sentInvites = await collaborationService.inviteCollaborators(documentId, invites);
      onInvitesSent(sentInvites);
      onOpenChange(false);
      
      // Reset form
      setEmails('');
      setMessage('');
      setPermission('comment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1f2e] border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Invite Collaborators</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send invitations to collaborate on this document
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="emails" className="text-gray-300">Email Addresses</Label>
            <Textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses (one per line or comma-separated)"
              className="bg-[#0f1419] border-gray-600 text-gray-200"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission" className="text-gray-300">Permission Level</Label>
            <Select value={permission} onValueChange={(value: CollaboratorPermission) => setPermission(value)}>
              <SelectTrigger className="bg-[#0f1419] border-gray-600 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-gray-600">
                {collaborationService.permissionLevels.slice(0, 3).map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    <div className="flex items-center space-x-2">
                      {getPermissionIcon(level.id)}
                      <span>{level.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to the invitation"
              className="bg-[#0f1419] border-gray-600 text-gray-200"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Sending...' : 'Send Invitations'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
