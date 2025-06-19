import React from 'react';
import { Bell, BellOff, Maximize2, Minimize2, Settings } from 'lucide-react';
// Import your translation hook (example: react-i18next)
const Header = ({ 
  onlineUsers, 
  notifications, 
  setNotifications, 
  isFullscreen, 
  setIsFullscreen 
}) => {
  const { t } = useTranslation();
  return (
}) => {
  return (
    <header className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {typeof t === 'function' ? t('header.title') : 'AnnotateApp'}
          </h1>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AnnotateApp
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">
            {typeof t === 'function' ? t('header.documentLabel', { file: 'Contract_v2.pdf' }) : 'Document: Contract_v2.pdf'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <OnlineUserAvatars users={onlineUsers} />

        <button
          onClick={() => setNotifications(!notifications)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {notifications ? <Bell size={18} /> : <BellOff size={18} />}
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Settings size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-sm font-medium cursor-pointer">
          👨‍💻
        </div>
      </div>
    </header>
  );
};

const OnlineUserAvatars = ({ users }) => (
  <div className="flex items-center space-x-1">
    {Array.isArray(users) && users.map((user) => (
      <div key={user.id} className="relative group">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-medium transition-transform hover:scale-110 cursor-pointer ${user.typing ? 'animate-bounce' : ''}`}>
          {user.avatar}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {user.name} {user.typing && '(typing...)'}
        </div>
      </div>
    ))}
  </div>
);

export default Header;