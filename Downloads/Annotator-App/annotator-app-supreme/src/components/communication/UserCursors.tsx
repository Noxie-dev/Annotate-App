import { useDocumentStore } from '@/stores/document-store';
import { MousePointer } from 'lucide-react';

interface UserCursorsProps {
  pageNumber: number;
  scale: number;
}

export function UserCursors({ pageNumber, scale }: UserCursorsProps) {
  const { userPresence, users } = useDocumentStore();

  const activePresence = userPresence.filter(
    presence => presence.pageNumber === pageNumber && presence.isActive
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {activePresence.map((presence) => {
        const user = users.find(u => u.id === presence.userId);
        if (!user || user.id === 'user-1') return null; // Don't show current user's cursor

        return (
          <div
            key={presence.userId}
            className="absolute transition-all duration-150 ease-out"
            style={{
              left: presence.x * scale,
              top: presence.y * scale,
              zIndex: 1000
            }}
          >
            {/* Cursor */}
            <div className="relative">
              <MousePointer 
                className="w-5 h-5 transform -rotate-12"
                style={{ color: user.color }}
              />
              
              {/* User name tag */}
              <div
                className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white shadow-lg whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
