import { Zap } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="h-screen bg-[#0f1419] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated logo */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto animate-pulse">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-30 animate-ping mx-auto"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-200 mb-2">
          Annotator-App
        </h1>
        
        <div className="text-purple-400 text-sm font-medium mb-6">
          Supreme Edition™
        </div>
        
        {/* Loading animation */}
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
        
        <p className="text-gray-400 mt-4 text-sm">
          Initializing collaboration workspace...
        </p>
      </div>
    </div>
  );
}
