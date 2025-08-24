'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Shield, Users, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ChatCharacter from '@/components/ChatCharacter';

interface LocalChatMessage {
  type: 'user' | 'ai1' | 'ai2';
  content: string;
  timestamp: Date;
  character?: string;
}

const IndependenceAssessment = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [aiCharacters, setAiCharacters] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChatSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفاً ابتدا وارد شوید');
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/assessment/start-independence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSessionId(data.data.session_id);
        setAssessmentStarted(true);
        setIsConnected(true);
        
        if (data.data.messages && Array.isArray(data.data.messages)) {
          const formattedMessages = data.data.messages.map((msg: any) => ({
            type: msg.type,
            content: msg.content,
            character: msg.character,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedMessages);
        }
        
        if (data.data.ai_characters && Array.isArray(data.data.ai_characters)) {
          setAiCharacters(data.data.ai_characters);
        }
        
        setLoading(false);
        toast.success("جلسه چت شروع شد. می‌توانید پیام خود را ارسال کنید.");

      } else {
        throw new Error(data.message || 'خطا در شروع جلسه چت');
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast.error("خطا در شروع جلسه چت. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
  };

  const getEndpoints = () => {
    const baseUrl = 'http://localhost:3001';
    return { 
      start: `${baseUrl}/api/assessment/start-independence`, 
      chat: `${baseUrl}/api/assessment/chat-independence` 
    };
  };

  const sendMessageToServer = async (messageContent: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفاً ابتدا وارد شوید');
        router.push('/login');
        return;
      }

      if (!sessionId) {
        toast.error('جلسه چت شروع نشده است');
        return;
      }

      const endpoints = getEndpoints();
      const response = await fetch(endpoints.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageContent,
          session_id: sessionId,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        if (data.data.messages && Array.isArray(data.data.messages)) {
          const newMessages = data.data.messages.map((msg: any) => ({
            type: msg.type,
            content: msg.content,
            character: msg.character,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(prev => [...prev, ...newMessages]);
        }

        if (data.data.type === "assessment_complete") {
          toast.success("ارزیابی استقلال تکمیل شد!");
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } else {
        throw new Error(data.message || 'خطا در ارسال پیام');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    console.log('Independence Assessment useEffect triggered:', {
      user: !!user,
      assessmentStarted
    });

    if (user && !assessmentStarted) {
      startChatSession();
    } else if (!user) {
      router.push('/login');
    }
  }, [user, assessmentStarted, router]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const messageToSend = currentMessage.trim();
    setCurrentMessage('');
    
    const userMessage: LocalChatMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    await sendMessageToServer(messageToSend);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('خروج موفقیت‌آمیز بود');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('خروج انجام شد');
      router.push('/');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-executive-pearl via-white to-executive-silver/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-executive-navy to-executive-navy-light rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-executive-charcoal mb-2">در حال بارگذاری ارزیابی استقلال...</h2>
          <p className="text-executive-ash">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-executive-pearl via-white to-executive-silver/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-executive-ash-light/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-executive-ash hover:text-executive-charcoal"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              بازگشت
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-executive-navy to-executive-navy-light rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-executive-charcoal">ارزیابی استقلال</h1>
                <p className="text-sm text-executive-ash">
                  {isConnected ? 'متصل' : 'در حال اتصال...'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-executive-charcoal">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-executive-ash">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-executive-ash-light text-executive-ash hover:bg-executive-ash-light/10"
            >
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-luxury border border-executive-ash-light/30 overflow-hidden">
          {/* AI Characters Display */}
          {aiCharacters.length > 0 && (
            <div className="bg-gradient-to-r from-executive-navy/5 to-executive-gold/5 p-4 border-b border-executive-ash-light/30">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-executive-navy" />
                <div className="flex gap-3">
                  {aiCharacters.map((character, index) => (
                    <ChatCharacter key={index} type="ai" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-executive-navy to-executive-navy-light text-white'
                    : message.type === 'ai1'
                    ? 'bg-gradient-to-r from-executive-gold/20 to-executive-gold/10 text-executive-charcoal border border-executive-gold/30'
                    : 'bg-gradient-to-r from-executive-silver/20 to-executive-silver/10 text-executive-charcoal border border-executive-silver/30'
                }`}>
                  {message.character && message.type !== 'user' && (
                    <p className="text-xs font-medium mb-1 opacity-70">{message.character}</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString('fa-IR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-executive-ash-light/20 border border-executive-ash-light/50 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-executive-ash rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-executive-ash rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-executive-ash rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-executive-ash-light/30 p-6">
            <div className="flex gap-3">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 min-h-[60px] resize-none border-executive-ash-light/50 focus:border-executive-navy/50 focus:ring-executive-navy/20"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="bg-gradient-to-r from-executive-navy to-executive-navy-light hover:from-executive-navy-light hover:to-executive-navy text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndependenceAssessment;
