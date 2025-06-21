import { lazy, Suspense } from 'react';
import { useDocumentStore } from '@/stores/document-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Lazy load heavy sidebar components
const ChatPanel = lazy(() => import('@/components/communication/ChatPanel').then(module => ({ default: module.ChatPanel })));
const AIPanel = lazy(() => import('@/components/ai/AIPanel').then(module => ({ default: module.AIPanel })));
const CommentsPanel = lazy(() => import('@/components/communication/CommentsPanel').then(module => ({ default: module.CommentsPanel })));
const ToolsPanel = lazy(() => import('@/components/annotation/ToolsPanel').then(module => ({ default: module.ToolsPanel })));
import { 
  MessageCircle, 
  Zap, 
  MessageSquare, 
  Palette,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export function Sidebar() {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    activePanel, 
    setActivePanel,
    chatMessages,
    annotations
  } = useDocumentStore();

  const unreadMessages = chatMessages.filter(msg => !msg.timestamp).length;
  const pendingComments = annotations.filter(ann => ann.type === 'text-comment').length;

  if (sidebarCollapsed) {
    return (
      <div className="w-12 bg-[#1a1f2e] border-l border-gray-800 flex flex-col items-center py-4 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(false)}
          className="text-gray-400 hover:text-gray-200 w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="h-px w-8 bg-gray-700" />
        
        <Button
          variant={activePanel === 'chat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setActivePanel('chat');
            setSidebarCollapsed(false);
          }}
          className="w-8 h-8 p-0 relative"
        >
          <MessageCircle className="w-4 h-4" />
          {unreadMessages > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs bg-red-500">
              {unreadMessages}
            </Badge>
          )}
        </Button>
        
        <Button
          variant={activePanel === 'ai' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setActivePanel('ai');
            setSidebarCollapsed(false);
          }}
          className="w-8 h-8 p-0"
        >
          <Zap className="w-4 h-4" />
        </Button>
        
        <Button
          variant={activePanel === 'comments' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setActivePanel('comments');
            setSidebarCollapsed(false);
          }}
          className="w-8 h-8 p-0 relative"
        >
          <MessageSquare className="w-4 h-4" />
          {pendingComments > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs bg-blue-500">
              {pendingComments}
            </Badge>
          )}
        </Button>
        
        <Button
          variant={activePanel === 'tools' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setActivePanel('tools');
            setSidebarCollapsed(false);
          }}
          className="w-8 h-8 p-0"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#1a1f2e] border-l border-gray-800 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">Collaboration</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(true)}
            className="text-gray-400 hover:text-gray-200 w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as any)} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 bg-[#0f1419] m-2 p-1 rounded-lg">
            <TabsTrigger 
              value="chat" 
              className="relative data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
              {unreadMessages > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs bg-red-500">
                  {unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Zap className="w-4 h-4 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="relative data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Notes
              {pendingComments > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs bg-blue-500">
                  {pendingComments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              <Palette className="w-4 h-4 mr-1" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
            <Suspense fallback={
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <ChatPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-hidden mt-0">
            <Suspense fallback={
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <AIPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 overflow-hidden mt-0">
            <Suspense fallback={
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <CommentsPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 overflow-hidden mt-0">
            <Suspense fallback={
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <ToolsPanel />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
