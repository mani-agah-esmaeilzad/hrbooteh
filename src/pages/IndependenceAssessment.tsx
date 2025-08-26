'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Shield, Users, MessageCircle, User, Briefcase, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LocalChatMessage {
  type: 'user' | 'ai1' | 'ai2';
  content: string;
  timestamp: Date;
  character?: string;
}

interface Character {
  name: string;
  role: string;
  avatar: string;
  position: { x: number; y: number };
  color: string;
}

const IndependenceAssessment = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [recentSpeaker, setRecentSpeaker] = useState<string | null>(null);

  // تعریف شخصیت‌های جلسه
  const characters: Character[] = [
    {
      name: "آقای توحیدی",
      role: "مدیر بخش",
      avatar: "👨‍💼",
      position: { x: 50, y: 15 },
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "سارا",
      role: "طراح تیم",
      avatar: "👩‍💻",
      position: { x: 20, y: 50 },
      color: "from-pink-500 to-pink-600"
    },
    {
      name: "احمد",
      role: "مسئول کیفیت",
      avatar: "👨‍🔧",
      position: { x: 80, y: 50 },
      color: "from-green-500 to-green-600"
    },
    {
      name: "خانم نوروزی",
      role: "بخش مالی",
      avatar: "👩‍💼",
      position: { x: 50, y: 85 },
      color: "from-purple-500 to-purple-600"
    },
    {
      name: user?.first_name || "شما",
      role: "سرپرست جدید",
      avatar: "🎯",
      position: { x: 50, y: 50 },
      color: "from-orange-500 to-orange-600"
    }
  ];

  const startChatSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفاً ابتدا وارد شوید');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/assessment/start-independence', {
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
        
        setLoading(false);
        toast.success("جلسه کاری شروع شد. می‌توانید در بحث شرکت کنید.");

      } else {
        throw new Error(data.message || 'خطا در شروع جلسه');
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast.error("خطا در شروع جلسه. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
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
        toast.error('جلسه شروع نشده است');
        return;
      }

      const response = await fetch('/api/assessment/chat-independence', {
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
          
          // نمایش پیام‌های جدید با انیمیشن
          newMessages.forEach((msg: LocalChatMessage, index: number) => {
            setTimeout(() => {
              setMessages(prev => [...prev, msg]);
              setRecentSpeaker(msg.character || null);
              setTimeout(() => setRecentSpeaker(null), 3000);
            }, index * 1000);
          });
        }

        // بررسی تکمیل ارزیابی
        if (data.data.type === "assessment_complete" || data.message === 'ارزیابی تکمیل شد') {
          toast.success("ارزیابی استقلال تکمیل شد!");
          
          if (data.data.analysis || data.data) {
            localStorage.setItem('independence_results', JSON.stringify({
              assessment_id: sessionId,
              final_analysis: data.data.analysis || data.data,
              completed_at: new Date().toISOString(),
              questionnaire_type: 'independence'
            }));
          }
          
          setTimeout(() => {
            router.push('/results');
          }, 2000);
          
          return;
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
    setRecentSpeaker(user?.first_name || "شما");
    setIsTyping(true);

    // پاک کردن recent speaker بعد از 3 ثانیه
    setTimeout(() => setRecentSpeaker(null), 3000);

    await sendMessageToServer(messageToSend);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
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

  // دریافت آخرین پیام هر شخصیت
  const getLatestMessageForCharacter = (characterName: string) => {
    const characterMessages = messages.filter(msg => 
      msg.character === characterName || 
      (msg.type === 'user' && characterName === (user?.first_name || "شما"))
    );
    return characterMessages[characterMessages.length - 1]?.content || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen meeting-room flex items-center justify-center">
        <div className="text-center animate-slideIn">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse character-avatar">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">در حال آماده‌سازی اتاق جلسه...</h2>
          <p className="text-slate-300 text-lg">تنظیمات صفحه در حال بارگذاری</p>
          <div className="mt-4 flex justify-center">
            <div className="typing-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen meeting-room">
      {/* Header */}
      <header className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-600/40 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              بازگشت
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">جلسه ارزیابی استقلال</h1>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {isConnected ? 'جلسه در حال برگزاری' : 'در حال اتصال...'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-300">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Meeting Room */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Room Description */}
          <div className="text-center mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-3">🏢 اتاق کنفرانس شرکت</h2>
            <p className="text-slate-300 text-lg">شما در جلسه‌ای برای بررسی پروژه مهم شرکت حضور دارید</p>
          </div>

          {/* Meeting Table */}
          <div className="relative meeting-room rounded-3xl shadow-2xl border border-slate-500/30 overflow-hidden animate-slideIn" 
               style={{ height: '650px' }}>
            
            {/* Table Surface */}
            <div className="absolute inset-6 table-surface rounded-2xl border border-amber-700/50 shadow-inner">
              {/* Table center decoration */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-amber-600/30 to-amber-800/40 rounded-full border-2 border-amber-500/50"></div>
              
              {/* Ambient lighting effect */}
              <div className="absolute inset-0 bg-gradient-radial from-amber-300/5 via-transparent to-transparent"></div>
            </div>

            {/* Characters around the table */}
            {characters.map((character, index) => {
              const currentMsg = getLatestMessageForCharacter(character.name);
              const isUserCharacter = character.name === (user?.first_name || "شما");
              const isRecentSpeaker = recentSpeaker === character.name;
              
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
                  style={{ 
                    left: `${character.position.x}%`, 
                    top: `${character.position.y}%`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {/* Speech bubble */}
                  {currentMsg && (
                    <div className="absolute bottom-full mb-6 left-1/2 transform -translate-x-1/2 animate-slideIn z-10">
                      <div className="speech-bubble">
                        <p className="text-slate-800 text-sm leading-relaxed font-medium">{currentMsg}</p>
                        {/* Character name badge */}
                        <div className="absolute -top-2 left-3 bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                          {character.name}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Character Avatar */}
                  <div className={`relative group character-avatar ${isUserCharacter ? 'ring-4 ring-orange-400/60' : ''} ${isRecentSpeaker ? 'animate-pulse' : ''}`}>
                    <div className={`w-24 h-24 bg-gradient-to-br ${character.color} rounded-full shadow-2xl flex items-center justify-center text-3xl border-4 border-white/20 ${isRecentSpeaker ? 'ring-4 ring-blue-400 ring-opacity-75' : ''}`}>
                      {character.avatar}
                    </div>
                    
                    {/* Character Info */}
                    <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                      <p className="text-white font-bold text-sm bg-slate-800/80 px-3 py-1 rounded-full border border-slate-600/50">
                        {character.name}
                      </p>
                      <p className="text-slate-300 text-xs mt-1">{character.role}</p>
                    </div>

                    {/* Typing indicator */}
                    {isTyping && !isUserCharacter && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <div className="typing-dots">
                          <div className="w-1 h-1"></div>
                          <div className="w-1 h-1"></div>
                          <div className="w-1 h-1"></div>
                        </div>
                      </div>
                    )}

                    {/* Status indicator for user */}
                    {isUserCharacter && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Meeting Stats */}
            <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-600/30">
              <p className="text-white text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                پیام‌ها: {messages.length}
              </p>
              <p className="text-slate-300 text-xs mt-1">
                شرکت‌کنندگان: {characters.length}
              </p>
            </div>

            {/* Environment decoration */}
            <div className="absolute top-6 left-6 w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-600/30 rounded-full border border-yellow-500/30 animate-pulse" title="نور اتاق"></div>
          </div>

          {/* Input Area */}
          <div className="mt-8 bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/40 shadow-2xl animate-fadeIn">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">نظر شما در جلسه:</label>
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="نظر خود را در جلسه بیان کنید..."
                  className="bg-slate-700/60 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30 min-h-[100px] resize-none text-base shadow-inner"
                  disabled={isTyping}
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg h-fit transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Send className="w-5 h-5 ml-2" />
                  {isTyping ? 'در حال ارسال...' : 'صحبت کنید'}
                </Button>
              </div>
            </div>
          </div>

          {/* Meeting Log */}
          <div className="mt-6 bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 max-h-40 overflow-y-auto animate-fadeIn">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              تاریخچه صحبت‌های جلسه
            </h3>
            <div className="space-y-2">
              {messages.slice(-5).map((message, index) => (
                <div key={index} className="text-slate-300 text-sm p-2 bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-blue-300">
                    {message.character || (message.type === 'user' ? 'شما' : 'سیستم')}:
                  </span>
                  <span className="mr-2">{message.content}</span>
                  <span className="text-xs text-slate-400 mr-2">
                    ({message.timestamp.toLocaleTimeString('fa-IR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })})
                  </span>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-slate-400 text-center py-4">هنوز صحبتی در جلسه نشده است...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndependenceAssessment;
