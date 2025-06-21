import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Clock,
  Download,
  Share2,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDocumentStore } from '@/stores/document-store';
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentSession {
  id: string;
  name: string;
  lastModified: string;
  collaborators: Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
  }>;
  pageCount: number;
  size: string;
  status: 'active' | 'completed' | 'draft';
  commentsCount: number;
  annotationsCount: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { documents, loadInitialData } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastModified');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Mock document sessions data
  const [documentSessions, setDocumentSessions] = useState<DocumentSession[]>([
    {
      id: '1',
      name: 'Q4 Financial Report.pdf',
      lastModified: '2024-01-15T10:30:00Z',
      collaborators: [
        { id: '1', name: 'Alex Chen', avatar: '/images/avatar-1.jpg', status: 'online' },
        { id: '2', name: 'Sarah Williams', avatar: '/images/avatar-2.jpg', status: 'online' },
        { id: '3', name: 'Michael Rodriguez', avatar: '/images/avatar-3.jpg', status: 'offline' },
      ],
      pageCount: 15,
      size: '2.4 MB',
      status: 'active',
      commentsCount: 12,
      annotationsCount: 28,
    },
    {
      id: '2',
      name: 'Product Roadmap 2024.pdf',
      lastModified: '2024-01-14T16:45:00Z',
      collaborators: [
        { id: '4', name: 'Emma Thompson', avatar: '/images/avatar-4.jpg', status: 'online' },
        { id: '5', name: 'David Kim', avatar: '/images/avatar-5.jpg', status: 'offline' },
      ],
      pageCount: 8,
      size: '1.2 MB',
      status: 'completed',
      commentsCount: 5,
      annotationsCount: 15,
    },
    {
      id: '3',
      name: 'Legal Contract Draft.pdf',
      lastModified: '2024-01-13T09:15:00Z',
      collaborators: [
        { id: '6', name: 'Lisa Park', avatar: '/images/avatar-6.jpg', status: 'offline' },
      ],
      pageCount: 22,
      size: '3.1 MB',
      status: 'draft',
      commentsCount: 3,
      annotationsCount: 7,
    },
  ]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const filteredDocuments = documentSessions.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastModified':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'collaborators':
        return b.collaborators.length - a.collaborators.length;
      default:
        return 0;
    }
  });

  const handleCreateNew = () => {
    setShowUploadDialog(true);
  };

  const handleFileUpload = async (file: File, metadata: any) => {
    // In a real app, this would upload the file and create a new document session
    console.log('Uploading file:', file.name, 'with metadata:', metadata);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock success - in real app, this would create a new document session
    const newSession: DocumentSession = {
      id: Date.now().toString(),
      name: file.name,
      lastModified: new Date().toISOString(),
      collaborators: [
        { id: user?.id || '1', name: user?.name || 'You', avatar: user?.avatar || '', status: 'online' }
      ],
      pageCount: Math.floor(Math.random() * 20) + 1,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      status: 'draft',
      commentsCount: 0,
      annotationsCount: 0,
    };

    setDocumentSessions(prev => [newSession, ...prev]);
  };

  const handleOpenDocument = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const formatLastModified = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <div className="border-b border-gray-700 bg-[#1a1f2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-200">Dashboard</h1>
              </div>

              {/* Navigation Links */}
              <nav className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-500"
                >
                  Dashboard
                </Link>
                <Link
                  to="/doc-library"
                  className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-gray-600"
                >
                  Doc Library
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gray-600 text-gray-200">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-400">
            Here are your recent document annotation sessions and collaboration activities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-200">{documentSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Collaborators</p>
                  <p className="text-2xl font-bold text-gray-200">
                    {documentSessions.reduce((acc, doc) => 
                      acc + doc.collaborators.filter(c => c.status === 'online').length, 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Comments</p>
                  <p className="text-2xl font-bold text-gray-200">
                    {documentSessions.reduce((acc, doc) => acc + doc.commentsCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Annotations</p>
                  <p className="text-2xl font-bold text-gray-200">
                    {documentSessions.reduce((acc, doc) => acc + doc.annotationsCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1f2e] border-gray-600 text-gray-200 placeholder-gray-500 pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-[#1a1f2e] border-gray-600 text-gray-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-[#1a1f2e] border-gray-600 text-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-600">
              <SelectItem value="lastModified">Last Modified</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="collaborators">Collaborators</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Document Sessions List */}
        <div className="space-y-4">
          {sortedDocuments.map((doc) => (
            <Card key={doc.id} className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-[#0f1419] rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-200 truncate">
                          {doc.name}
                        </h3>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatLastModified(doc.lastModified)}
                        </span>
                        <span>{doc.pageCount} pages</span>
                        <span>{doc.size}</span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {doc.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Collaborators */}
                    <div className="flex -space-x-2">
                      {doc.collaborators.slice(0, 3).map((collaborator) => (
                        <Avatar key={collaborator.id} className="w-8 h-8 border-2 border-[#1a1f2e]">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback className="bg-gray-600 text-gray-200 text-xs">
                            {collaborator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {doc.collaborators.length > 3 && (
                        <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-[#1a1f2e] flex items-center justify-center">
                          <span className="text-xs text-gray-200">+{doc.collaborators.length - 3}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDocument(doc.id)}
                        className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1a1f2e] border-gray-600">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                            <Users className="w-4 h-4 mr-2" />
                            Manage Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">No documents found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first document annotation session.'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Session
              </Button>
            )}
          </div>
        )}
      </div>

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleFileUpload}
      />
    </div>
  );
}
