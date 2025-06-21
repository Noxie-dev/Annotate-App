import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDocumentStore } from '@/stores/document-store';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { 
  Share, 
  Users, 
  MessageCircle, 
  Video, 
  Phone,
  Zap,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Header() {
  const { 
    currentDocument, 
    users, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useDocumentStore();

  const activeUsers = users.filter(user => user.status === 'online');

  return (
    <header className="bg-[#1a1f2e] border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section - Document Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-200">
                Annotator-App
              </h1>
              <div className="text-xs text-purple-400 font-medium">
                Supreme Edition™
              </div>
            </div>
          </div>
          
          {currentDocument && (
            <>
              <div className="h-6 w-px bg-gray-700" />
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="text-sm font-medium text-gray-200">
                    {currentDocument.title}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {currentDocument.fileSize} • {currentDocument.totalPages} pages
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-700">
                  Live
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Center Section - Page Navigation */}
        {currentDocument && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="text-gray-400 hover:text-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm text-gray-300 px-3 py-1 bg-[#0f1419] rounded-md border border-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="text-gray-400 hover:text-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Right Section - Actions & Users */}
        <div className="flex items-center space-x-3">
          {/* Active Users */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 4).map((user) => (
                <Avatar key={user.id} className="w-8 h-8 border-2 border-[#1a1f2e]">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {activeUsers.length > 4 && (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300">
                +{activeUsers.length - 4}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-700" />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-700" />

          {/* User Profile */}
          <Suspense fallback={
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
          }>
            <ProfileDropdown />
          </Suspense>

          <div className="h-6 w-px bg-gray-700" />

          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-gray-200"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
