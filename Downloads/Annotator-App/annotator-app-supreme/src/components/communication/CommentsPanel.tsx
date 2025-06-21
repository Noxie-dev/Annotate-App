import { useState } from 'react';
import { useDocumentStore } from '@/stores/document-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Reply, 
  Trash2, 
  Edit3, 
  Clock,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function CommentsPanel() {
  const { 
    annotations, 
    users, 
    updateAnnotation, 
    deleteAnnotation,
    setCurrentPage
  } = useDocumentStore();
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const textComments = annotations.filter(ann => ann.type === 'text-comment');

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const comment = annotations.find(ann => ann.id === commentId);
    if (!comment) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      userId: 'user-1', // Current user
      content: replyText,
      timestamp: new Date().toISOString()
    };

    updateAnnotation(commentId, {
      replies: [...(comment.replies || []), newReply]
    });

    setReplyText('');
    setReplyingTo(null);
  };

  const navigateToComment = (annotation: any) => {
    setCurrentPage(annotation.pageNumber);
    // Here you could also highlight the annotation
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Comments Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-200 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments & Notes
            </h4>
            <p className="text-xs text-gray-400">
              {textComments.length} {textComments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-900/20 text-blue-400">
            {textComments.filter(c => !c.replies?.length).length} new
          </Badge>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {textComments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">No comments yet</h3>
            <p className="text-xs text-gray-400">
              Click on the document to add your first comment
            </p>
          </div>
        ) : (
          textComments.map((comment) => {
            const user = getUserById(comment.userId);
            const isReplying = replyingTo === comment.id;

            return (
              <div key={comment.id} className="border border-gray-700 rounded-lg p-4 bg-[#0f1419]">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                        {user?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium text-gray-200">{user?.name}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(comment.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToComment(comment)}
                    className="text-blue-400 hover:text-blue-300 p-1"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs ml-1">Page {comment.pageNumber}</span>
                  </Button>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-gray-200 mb-3">{comment.content}</p>

                {/* Comment Actions */}
                <div className="flex items-center space-x-2 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                    className="text-gray-400 hover:text-gray-200 text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-200 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAnnotation(comment.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="border-l-2 border-gray-600 pl-4 space-y-3">
                    {comment.replies.map((reply) => {
                      const replyUser = getUserById(reply.userId);
                      return (
                        <div key={reply.id} className="flex space-x-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={replyUser?.avatar} alt={replyUser?.name} />
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs">
                              {replyUser?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-medium text-gray-300">{replyUser?.name}</span>
                              <span className="text-xs text-gray-500">{formatTime(reply.timestamp)}</span>
                            </div>
                            <p className="text-xs text-gray-200">{reply.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Input */}
                {isReplying && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="bg-[#1a1f2e] border-gray-600 text-gray-200 text-sm resize-none"
                      rows={2}
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="text-gray-400 hover:text-gray-200 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
