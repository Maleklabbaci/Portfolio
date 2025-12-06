import React, { useState, useRef, useEffect } from 'react';
import { generateAgencyResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, CheckCircle } from 'lucide-react';

export const ContactAI: React.FC = () => {
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Bonjour ! Je suis l'IA de iVision Agency. Je peux vous aider à structurer votre projet ou répondre à vos questions sur nos services. Comment puis-je vous aider ?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Email Form State
  const [emailFormStatus, setEmailFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await generateAgencyResponse(input);
    
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: aiResponseText, timestamp: Date.now() }]);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFormStatus('sending');
    // Simulation d'envoi API
    setTimeout(() => {
      setEmailFormStatus('success');
      // Reset après 3 secondes
      setTimeout(() => setEmailFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#0B1120] to-brand-dark">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Classic Contact Info */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">Prêt à collaborer ?</h2>
            <p className="text-gray-400 mb-8 text-lg">
              Discutons de votre prochain projet. Que ce soit pour une refonte visuelle complète ou une campagne publicitaire agressive, nous sommes là.
            </p>
            
            {emailFormStatus === 'success' ? (
              <div className="bg-green-500/10 border border-green-500 rounded-xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message envoyé !</h3>
                <p className="text-gray-300">Notre équipe humaine vous recontactera sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Nom complet</label>
                  <input required type="text" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                  <input required type="email" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Message</label>
                  <textarea required rows={4} className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="Parlez-nous de votre projet..."></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={emailFormStatus === 'sending'}
                  className="w-full bg-white text-brand-dark font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {emailFormStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>

          {/* AI Chat Interface */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-accent to-brand-purple flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">VisionBot</h3>
                  <p className="text-xs text-brand-accent">Assistant iVision • En ligne</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                     <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                       <Bot className="w-4 h-4 text-gray-400" />
                     </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-accent text-white rounded-br-none' 
                      : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                  }`}>
                    {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
                  </div>
                  {msg.role === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                       <User className="w-4 h-4 text-gray-300" />
                     </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700 rounded-bl-none flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <form onSubmit={handleChatSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez une question à notre IA..."
                  className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-brand-accent"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-brand-accent hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};