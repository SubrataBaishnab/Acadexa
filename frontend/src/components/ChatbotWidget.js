import React, { useState } from 'react';
import { chatbotService } from '../services/apiService';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! I can help you find the best supervisors and PhD advisors based on your research interests. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [advisorType, setAdvisorType] = useState('supervisor');
  const [researchInterests, setResearchInterests] = useState([]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatbotService.getSmartRecommendation({
        query: inputValue,
        researchInterests: researchInterests.length > 0 ? researchInterests : ['AI'],
        type: advisorType,
      });

      let botText = 'No response received';
      let recommendations = [];

      // Handle different response structures
      if (response.data) {
        if (response.data.data) {
          botText = response.data.data.chatResponse || response.data.data;
          recommendations = response.data.data.recommendations || [];
        } else if (response.data.chatResponse) {
          botText = response.data.chatResponse;
          recommendations = response.data.recommendations || [];
        } else {
          botText = JSON.stringify(response.data);
        }
      } else {
        botText = JSON.stringify(response);
      }

      const botMessage = {
        id: messages.length + 2,
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
        recommendations: recommendations,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorText = error.response?.data?.error || error.message || 'Unknown error occurred';
      const errorMessage = {
        id: messages.length + 2,
        text: `Error: ${errorText}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col mb-4 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Advisor Recommendation Bot</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-800 rounded p-1"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm">
                <input
                  type="radio"
                  name="advisor"
                  value="supervisor"
                  checked={advisorType === 'supervisor'}
                  onChange={(e) => setAdvisorType(e.target.value)}
                />
                <span className="ml-2">Supervisor</span>
              </label>
              <label className="block text-sm">
                <input
                  type="radio"
                  name="advisor"
                  value="professor"
                  checked={advisorType === 'professor'}
                  onChange={(e) => setAdvisorType(e.target.value)}
                />
                <span className="ml-2">PhD Professor</span>
              </label>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.recommendations && (
                    <div className="mt-2 text-xs">
                      {msg.recommendations.slice(0, 2).map((rec, idx) => (
                        <p key={idx} className="mt-1">
                          • {rec.firstName} {rec.lastName} ({rec.matchScore?.toFixed(0)}%)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all text-2xl"
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};

export default ChatbotWidget;
