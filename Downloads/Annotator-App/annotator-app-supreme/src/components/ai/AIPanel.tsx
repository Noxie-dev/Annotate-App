import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocumentStore } from '@/stores/document-store';
import { 
  Zap, 
  Send, 
  Search, 
  FileText, 
  Lightbulb, 
  TrendingUp,
  Brain,
  Sparkles
} from 'lucide-react';

const sampleInsights = [
  {
    id: 'insight-1',
    type: 'summary',
    title: 'Document Summary',
    content: 'This quarterly financial report shows strong performance with 15% revenue growth and improved operational efficiency across all departments.',
    confidence: 0.92,
    timestamp: '2025-06-20T10:15:00Z'
  },
  {
    id: 'insight-2',
    type: 'suggestion',
    title: 'Key Recommendations',
    content: 'Consider highlighting the supply chain improvements mentioned on page 5, as they directly impact the profitability metrics discussed.',
    confidence: 0.87,
    timestamp: '2025-06-20T10:12:00Z'
  },
  {
    id: 'insight-3',
    type: 'analysis',
    title: 'Risk Assessment',
    content: 'The document identifies operational cost increases as the primary risk factor for Q4 projections.',
    confidence: 0.94,
    timestamp: '2025-06-20T10:08:00Z'
  }
];

const quickActions = [
  { icon: FileText, label: 'Summarize Document', description: 'Get a concise overview' },
  { icon: Search, label: 'Extract Key Points', description: 'Find important information' },
  { icon: TrendingUp, label: 'Analyze Trends', description: 'Identify patterns and insights' },
  { icon: Lightbulb, label: 'Generate Suggestions', description: 'Get improvement recommendations' }
];

export function AIPanel() {
  const { currentDocument } = useDocumentStore();
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>>([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. I can help you analyze documents, answer questions, and provide insights. What would you like to know?',
      timestamp: new Date().toISOString()
    }
  ]);

  const handleSendQuery = () => {
    if (!query.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user' as const,
      content: query,
      timestamp: new Date().toISOString()
    };

    // Simulate AI response
    const aiResponse = {
      type: 'ai' as const,
      content: generateAIResponse(query),
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage, aiResponse]);
    setQuery('');
  };

  const generateAIResponse = (question: string) => {
    // Simple response simulation
    const responses = [
      'Based on the document analysis, I found that the revenue figures show a consistent upward trend throughout Q3.',
      'The key performance indicators suggest strong market positioning and operational efficiency improvements.',
      'I notice several areas where the document could benefit from additional clarification and supporting data.',
      'The financial projections appear realistic based on historical performance and current market conditions.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickAction = (action: string) => {
    const query = `Please ${action.toLowerCase()} for this document`;
    setQuery(query);
    handleSendQuery();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'summary': return FileText;
      case 'suggestion': return Lightbulb;
      case 'analysis': return TrendingUp;
      default: return Brain;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* AI Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200">AI Assistant</h4>
            <p className="text-xs text-purple-400">Powered by GPT-4</p>
          </div>
        </div>
      </div>

      {/* AI Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3 bg-[#0f1419] m-2 p-1 rounded-lg">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Insights
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Search
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-800">
              <h5 className="text-xs font-medium text-gray-400 mb-3">Quick Actions</h5>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAction(action.label)}
                    className="flex flex-col items-start p-3 h-auto text-left"
                  >
                    <action.icon className="w-4 h-4 mb-1 text-purple-400" />
                    <span className="text-xs font-medium text-gray-200">{action.label}</span>
                    <span className="text-xs text-gray-400">{action.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0f1419] border border-gray-700 text-gray-200'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-400">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex space-x-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about this document..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                  className="bg-[#0f1419] border-gray-600 text-gray-200"
                />
                <Button
                  onClick={handleSendQuery}
                  disabled={!query.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="flex-1 overflow-y-auto mt-0">
            <div className="p-4 space-y-4">
              {sampleInsights.map((insight) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <div key={insight.id} className="border border-gray-700 rounded-lg p-4 bg-[#0f1419]">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h6 className="text-sm font-medium text-gray-200">{insight.title}</h6>
                          <Badge 
                            variant="secondary" 
                            className="bg-green-900/20 text-green-400 text-xs"
                          >
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300">{insight.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="flex-1 flex flex-col mt-0">
            <div className="p-4 border-b border-gray-800">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search across all documents..."
                  className="bg-[#0f1419] border-gray-600 text-gray-200"
                />
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-300 mb-2">Semantic Search</h3>
                <p className="text-xs text-gray-400">
                  Search for concepts, ideas, and meaning across your documents
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
