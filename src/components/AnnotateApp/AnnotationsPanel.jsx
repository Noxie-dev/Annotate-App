import React from 'react';
import { Eye } from 'lucide-react';

const AnnotationsPanel = () => {
  const annotations = [
    {
      id: 1,
      location: 'Page 1 - Clause 3.2',
      color: 'cyan',
      text: 'Need clarification on payment terms and delivery schedule.',
      author: 'Sophia',
      time: '2 mins ago'
    },
    {
      id: 2,
      location: 'Page 2 - Section 4',
      color: 'purple',
      text: 'Approved - looks good to proceed with these terms.',
      author: 'You',
      time: '5 mins ago'
    },
    {
      id: 3,
      location: 'Page 3 - Footer',
      color: 'yellow',
      text: 'Signature block needs to be updated with new format.',
      author: 'Maya',
      time: '10 mins ago'
    }
  ];

  return (
    <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-2">Annotations</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span>12 Total</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>8 Yours</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {annotations.map(annotation => (
          <AnnotationItem key={annotation.id} annotation={annotation} />
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95">
          Save Annotation
        </button>
      </div>
    </div>
  );
};

const AnnotationItem = ({ annotation }) => (
  <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
    <div className="flex items-start justify-between mb-2">
      <span className={`text-sm font-medium text-${annotation.color}-400`}>{annotation.location}</span>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye size={14} className="text-gray-400" />
      </button>
    </div>
    <p className="text-sm text-gray-300 mb-2">{annotation.text}</p>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>by {annotation.author}</span>
      <span>{annotation.time}</span>
    </div>
  </div>
);

export default AnnotationsPanel;