import { useDocumentStore } from '@/stores/document-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { AnnotationTool } from '@/types';
import {
  MousePointer,
  Highlighter,
  Type,
  Pen,
  Square,
  Circle,
  ArrowRight,
  Eraser,
  Palette
} from 'lucide-react';

const annotationTools: AnnotationTool[] = [
  { id: 'select', name: 'Select', icon: 'MousePointer', type: 'select' },
  { id: 'highlight', name: 'Highlight', icon: 'Highlighter', type: 'highlight', color: '#fbbf24' },
  { id: 'text', name: 'Text Comment', icon: 'Type', type: 'text', color: '#3b82f6' },
  { id: 'draw', name: 'Draw', icon: 'Pen', type: 'draw', color: '#ef4444', size: 2 },
  { id: 'rectangle', name: 'Rectangle', icon: 'Square', type: 'rectangle', color: '#8b5cf6' },
  { id: 'circle', name: 'Circle', icon: 'Circle', type: 'circle', color: '#10b981' },
  { id: 'arrow', name: 'Arrow', icon: 'ArrowRight', type: 'arrow', color: '#f59e0b' },
  { id: 'eraser', name: 'Eraser', icon: 'Eraser', type: 'eraser' },
];

const colors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export function ToolsPanel() {
  const { currentTool, setCurrentTool } = useDocumentStore();

  const getIcon = (iconName: string) => {
    const icons = {
      MousePointer,
      Highlighter,
      Type,
      Pen,
      Square,
      Circle,
      ArrowRight,
      Eraser,
    };
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const updateToolColor = (color: string) => {
    setCurrentTool({ ...currentTool, color });
  };

  const updateToolSize = (size: number[]) => {
    setCurrentTool({ ...currentTool, size: size[0] });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Tool Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Annotation Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          {annotationTools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool.id === tool.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool(tool)}
              className={`flex items-center justify-start space-x-2 h-10 ${
                currentTool.id === tool.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {getIcon(tool.icon)}
              <span className="text-xs">{tool.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Color Palette */}
      {currentTool.type !== 'select' && currentTool.type !== 'eraser' && (
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Color
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => updateToolColor(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  currentTool.color === color 
                    ? 'border-white scale-110' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Brush Size */}
      {(currentTool.type === 'draw' || currentTool.type === 'eraser') && (
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-3">
            Brush Size: {currentTool.size || 2}px
          </h4>
          <Slider
            value={[currentTool.size || 2]}
            onValueChange={updateToolSize}
            max={20}
            min={1}
            step={1}
            className="w-full"
          />
          {/* Preview */}
          <div className="flex justify-center mt-3">
            <div
              className="rounded-full"
              style={{
                width: `${(currentTool.size || 2) * 2}px`,
                height: `${(currentTool.size || 2) * 2}px`,
                backgroundColor: currentTool.color || '#3b82f6'
              }}
            />
          </div>
        </div>
      )}

      <Separator className="bg-gray-700" />

      {/* Quick Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-gray-200">
            Clear All Annotations
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-gray-200">
            Export Annotations
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-gray-200">
            Import Annotations
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Layer Controls */}
      <div>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Layers</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">My Annotations</span>
            <Badge variant="secondary" className="bg-blue-900/20 text-blue-400">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Team Annotations</span>
            <Badge variant="secondary" className="bg-green-900/20 text-green-400">
              Visible
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Comments</span>
            <Badge variant="secondary" className="bg-purple-900/20 text-purple-400">
              Visible
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
