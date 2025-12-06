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
    setTimeout(() => {
      setEmailFormStatus('success');
      setTimeout(() => setEmailFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-brand-light">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Classic Contact Info */}
          <div>
            <h2 className="text-5xl font-black text-brand-black mb-6">Let's talk.</h2>
            <p className="text-gray-500 mb-10 text-lg leading-relaxed">
              Discutons de votre prochain projet. Que ce soit pour une refonte visuelle complète ou une campagne publicitaire agressive, nous sommes là.
            </p>
            
            {emailFormStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-gray-500">Notre équipe humaine vous recontactera sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-brand-black text-sm font-bold mb-2 uppercase tracking-wider">Nom complet</label>
                  <input required type="text" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-brand-black focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-brand-black text-sm font-bold mb-2 uppercase tracking-wider">Email</label>
                  <input required type="email" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-brand-black focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-brand-black text-sm font-bold mb-2 uppercase tracking-wider">Message</label>
                  <textarea required rows={4} className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-brand-black focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" placeholder="Parlez-nous de votre projet..."></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={emailFormStatus === 'sending'}
                  className="w-full bg-brand-black text-white font-bold py-5 rounded-xl hover:bg-brand-accent transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-wait"
                >
                  {emailFormStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>

          {/* AI Chat Interface */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-[650px] shadow-2xl shadow-gray-200/50">
            <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center relative">
                  <Sparkles className="w-6 h-6 text-brand-accent" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-brand-black font-bold text-lg">VisionBot</h3>
                  <p className="text-xs text-gray-400 font-medium">Assistant iVision • Always Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                     <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                       <Bot className="w-4 h-4 text-brand-accent" />
                     </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-accent text-white rounded-br-none' 
                      : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                  }`}>
                    {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 rounded-bl-none flex gap-1 items-center shadow-sm">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleChatSend} className="flex gap-3 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez une question..."
                  className="flex-1 bg-gray-50 border-0 text-brand-black rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-brand-black hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center"
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