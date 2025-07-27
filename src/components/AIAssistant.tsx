import React, { useState } from 'react';
import { apiService } from '../services/api';
import { X, Send, Bot, User, HelpCircle, Zap } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA pour la GMAO. Comment puis-je vous aider aujourd\'hui ?',
      time: '14:30'
    }
  ]);

  const faqItems = [
    {
      question: "Comment auditer une VMC ?",
      answer: "Pour auditer une VMC, vérifiez l'état des filtres, le fonctionnement des moteurs, les niveaux sonores et l'étanchéité des conduits."
    },
    {
      question: "Je ne trouve pas l'équipement...",
      answer: "Utilisez la fonction 'Créer équipement + auditer' et scannez la plaque signalétique avec l'OCR pour un ajout automatique."
    },
    {
      question: "Comment générer un rapport ?",
      answer: "Allez dans 'Livrables' puis cliquez sur 'Générer nouveau rapport'. Sélectionnez la période et le site souhaités."
    },
    {
      question: "Problème d'import CSV",
      answer: "Assurez-vous que votre fichier respecte le format avec les colonnes : référence, type, localisation, domaine. L'IA vous aidera au mapping."
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: message,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Real AI response
      handleAIResponse(message);
    }
  };

  const handleAIResponse = async (userMessage: string) => {
    try {
      const response = await apiService.chatWithAI(userMessage);
      
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: response.response,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: "Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleFAQClick = async (faq: typeof faqItems[0]) => {
    const newMessages = [
      {
        id: messages.length + 1,
        type: 'user',
        content: faq.question,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      },
    ];
    setMessages(prev => [...prev, newMessages[0]]);
    
    // Get AI response for the FAQ question
    await handleAIResponse(faq.question);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
      <div className="bg-white rounded-lg w-96 h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assistant IA</h3>
              <p className="text-xs text-green-600">En ligne</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ rapide */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-1">
            <HelpCircle className="w-4 h-4" />
            <span>Questions fréquentes</span>
          </h4>
          <div className="space-y-2">
            {faqItems.slice(0, 2).map((faq, index) => (
              <button
                key={index}
                onClick={() => handleFAQClick(faq)}
                className="w-full text-left p-2 text-xs bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tapez votre question..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;