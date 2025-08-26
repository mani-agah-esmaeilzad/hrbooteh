'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Shield, Users, MessageCircle, User, Briefcase, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from "@/hooks/useResponsive";
import { toast } from 'sonner';

interface LocalChatMessage {
  type: 'user' | 'ai1' | 'ai2';
  content: string;
  timestamp: Date;
  character?: string;
  id?: string;
}

interface Character {
  name: string;
  role: string;
  avatar: string;
  position: { x: number; y: number };
  color: string;
  mobilePosition?: { x: number; y: number };
  currentMessage?: string;
  messageVisible?: boolean;
}

const IndependenceAssessment = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [recentSpeaker, setRecentSpeaker] = useState<string | null>(null);
  const [showingMessages, setShowingMessages] = useState(false);
  
  // State برای مدیریت نمایش پیام‌های شخصیت‌ها
  const [characterMessages, setCharacterMessages] = useState<{[key: string]: string}>({});
  const [visibleCharacters, setVisibleCharacters] = useState<{[key: string]: boolean}>({});

  // تعریف شخصیت‌های جلسه با موقعیت‌های ریسپانسیو
  const characters: Character[] = [
    {
      name: "آقای توحیدی",
      role: "مدیر بخش",
      avatar: "👨‍💼",
      position: { x: 50, y: 15 },
      mobilePosition: { x: 50, y: 10 },
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "سارا",
      role: "طراح تیم",
      avatar: "👩‍💻",
      position: { x: 15, y: 45 },
      mobilePosition: { x: 20, y: 35 },
      color: "from-pink-500 to-pink-600"
    },
    {
      name: "احمد",
      role: "مسئول کیفیت",
      avatar: "👨‍🔧",
      position: { x: 85, y: 45 },
      mobilePosition: { x: 80, y: 35 },
      color: "from-green-500 to-green-600"
    },
    {
      name: "خانم نوروزی",
      role: "بخش مالی",
      avatar: "👩‍💼",
      position: { x: 50, y: 85 },
      mobilePosition: { x: 50, y: 90 },
      color: "from-purple-500 to-purple-600"
    },
    {
      name: user?.first_name || "شما",
      role: "سرپرست جدید",
      avatar: "🎯",
      position: { x: 50, y: 50 },
      mobilePosition: { x: 50, y: 62 },
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
          const formattedMessages = data.data.messages.map((msg: any, index: number) => ({
            type: msg.type,
            content: msg.content,
            character: msg.character,
            timestamp: new Date(msg.timestamp),
            id: `initial-${index}`
          }));
          
          // ذخیره پیام‌ها در state اصلی
          setMessages(formattedMessages);
          
          // نمایش تدریجی پیام‌ها
          await showMessagesSequentially(formattedMessages);
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

  // پاک کردن همه پیام‌های نمایشی
  const clearAllVisibleMessages = () => {
    setCharacterMessages({});
    setVisibleCharacters({});
    setRecentSpeaker(null);
  };

  // نمایش تدریجی پیام‌ها
  const showMessagesSequentially = async (newMessages: LocalChatMessage[]) => {
    setShowingMessages(true);
    
    // پاک کردن پیام‌های قبلی
    clearAllVisibleMessages();
    
    for (let i = 0; i < newMessages.length; i++) {
      const msg = newMessages[i];
      const characterName = msg.character || (msg.type === 'user' ? (user?.first_name || "شما") : 'سیستم');
      
      // نمایش پیام برای شخصیت
      setCharacterMessages(prev => ({
        ...prev,
        [characterName]: msg.content
      }));
      
      setVisibleCharacters(prev => ({
        ...prev,
        [characterName]: true
      }));
      
      setRecentSpeaker(characterName);
      
      // وقفه بین پیام‌ها (3 ثانیه برای خواندن راحت)
      if (i < newMessages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // پاک کردن recent speaker بعد از 2 ثانیه
    setTimeout(() => setRecentSpeaker(null), 2000);
    setShowingMessages(false);
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
          const newMessages = data.data.messages.map((msg: any, index: number) => ({
            type: msg.type,
            content: msg.content,
            character: msg.character,
            timestamp: new Date(msg.timestamp),
            id: `response-${Date.now()}-${index}`
          }));
          
          // اضافه کردن پیام‌های جدید به لیست کلی
          setMessages(prev => [...prev, ...newMessages]);
          
          // نمایش تدریجی پیام‌های جدید
          await showMessagesSequentially(newMessages);
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
    if (!currentMessage.trim() || isTyping || showingMessages) return;

    const messageToSend = currentMessage.trim();
    setCurrentMessage('');
    
    const userMessage: LocalChatMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      id: `user-${Date.now()}`
    };
    
    // اضافه کردن پیام کاربر به لیست
    setMessages(prev => [...prev, userMessage]);
    
    // پاک کردن همه پیام‌های نمایشی قبل از ارسال
    clearAllVisibleMessages();
    
    // نمایش پیام کاربر
    const userName = user?.first_name || "شما";
    setCharacterMessages(prev => ({
      ...prev,
      [userName]: messageToSend
    }));
    setVisibleCharacters(prev => ({
      ...prev,
      [userName]: true
    }));
    setRecentSpeaker(userName);
    
    setIsTyping(true);

    // پاک کردن recent speaker بعد از 2 ثانیه
    setTimeout(() => setRecentSpeaker(null), 2000);

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

  if (loading) {
    return (
      <div className="min-h-screen meeting-room flex items-center justify-center px-4">
        <div className="text-center animate-slideIn max-w-md w-full loading-container">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse character-avatar">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">در حال آماده‌سازی اتاق جلسه...</h2>
          <p className="text-slate-300 text-base md:text-lg">تنظیمات صفحه در حال بارگذاری</p>
          <div className="mt-6 flex justify-center">
            <div className="typing-dots-enhanced">
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 p-2"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
              <span className="hidden sm:inline">بازگشت</span>
            </Button>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm md:text-xl font-bold text-white">جلسه ارزیابی استقلال</h1>
                <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1 md:gap-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  {isConnected ? 'جلسه در حال برگزاری' : 'در حال اتصال...'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-300">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 text-xs md:text-sm px-2 md:px-3"
            >
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Meeting Room */}
      <main className="flex-1 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Room Description */}
          <div className="text-center mb-4 md:mb-8 animate-fadeIn">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3">🏢 اتاق کنفرانس شرکت</h2>
            <p className="text-slate-300 text-sm md:text-lg">شما در جلسه‌ای برای بررسی پروژه مهم شرکت حضور دارید</p>
            {showingMessages && (
              <div className="mt-2 text-blue-400 text-sm animate-pulse">
                🗣️ در حال نمایش صحبت‌های جلسه...
              </div>
            )}
          </div>

          {/* Meeting Table */}
          <div 
            className="relative meeting-room rounded-2xl md:rounded-3xl shadow-2xl border border-slate-500/30 overflow-hidden animate-slideIn" 
            style={{ height: isMobile ? '350px' : '500px', minHeight: '300px' }}
          >
            
            {/* Table Surface */}
            <div className="absolute inset-3 md:inset-6 table-surface rounded-xl md:rounded-2xl border border-amber-700/50 shadow-inner">
              {/* Table center decoration */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-amber-600/30 to-amber-800/40 rounded-full border-2 border-amber-500/50"></div>
              
              {/* Ambient lighting effect */}
              <div className="absolute inset-0 bg-gradient-radial from-amber-300/5 via-transparent to-transparent"></div>
            </div>

            {/* Characters around the table */}
            {characters.map((character, index) => {
              const characterName = character.name;
              const currentMsg = characterMessages[characterName] || '';
              const isVisible = visibleCharacters[characterName] || false;
              const isUserCharacter = characterName === (user?.first_name || "شما");
              const isRecentSpeaker = recentSpeaker === characterName;
              
              // استفاده از موقعیت موبایل در صفحات کوچک
              const position = isMobile ? character.mobilePosition || character.position : character.position;
              
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
                  style={{ 
                    left: `${position.x}%`, 
                    top: `${position.y}%`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {/* Speech bubble - فقط وقتی پیام داره و مشاهده شده باشه */}
                  {currentMsg && isVisible && (
                    <div className="absolute bottom-full mb-3 md:mb-6 left-1/2 transform -translate-x-1/2 animate-messagePopIn z-10">
                      <div className="speech-bubble-enhanced">
                        <p className="text-slate-800 text-sm md:text-base leading-relaxed font-medium break-words">
                          {currentMsg}
                        </p>
                        {/* Character name badge */}
                        <div className="absolute -top-2 left-2 md:left-3 bg-slate-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          {characterName}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Character Avatar - ریسپانسیو */}
                  <div className={`relative group character-avatar transition-enhanced ${isUserCharacter ? 'ring-2 md:ring-4 ring-orange-400/60' : ''} ${isRecentSpeaker ? 'character-speaking' : ''}`}>
                    <div className={`w-12 h-12 md:w-24 md:h-24 bg-gradient-to-br ${character.color} rounded-full shadow-2xl flex items-center justify-center text-lg md:text-3xl border-2 md:border-4 border-white/20`}>
                      {character.avatar}
                    </div>
                    
                    {/* Character Info */}
                    <div className="absolute top-full mt-2 md:mt-3 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                      <p className="text-white font-bold text-xs md:text-sm bg-slate-800/80 px-2 md:px-3 py-1 rounded-full border border-slate-600/50">
                        {characterName}
                      </p>
                      <p className="text-slate-300 text-xs mt-1 hidden md:block">{character.role}</p>
                    </div>

                    {/* Typing indicator */}
                    {isTyping && !isUserCharacter && (
                      <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <div className="typing-dots-enhanced">
                          <div className="w-1 h-1"></div>
                          <div className="w-1 h-1"></div>
                          <div className="w-1 h-1"></div>
                        </div>
                      </div>
                    )}

                    {/* Status indicator for user */}
                    {isUserCharacter && (
                      <div className="absolute -top-1 md:-top-2 -right-1 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Meeting Stats */}
            <div className="absolute top-3 md:top-6 right-3 md:right-6 bg-black/40 backdrop-blur-sm rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 border border-slate-600/30">
              <p className="text-white text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2">
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                پیام‌ها: {messages.length}
              </p>
              <p className="text-slate-300 text-xs mt-1 hidden md:block">
                شرکت‌کنندگان: {characters.length}
              </p>
            </div>

            {/* Environment decoration */}
            <div className="absolute top-3 md:top-6 left-3 md:left-6 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400/20 to-amber-600/30 rounded-full border border-yellow-500/30 animate-pulse" title="نور اتاق"></div>
          </div>

          {/* Input Area - ریسپانسیو */}
          <div className="mt-4 md:mt-8 input-area-enhanced rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">نظر شما در جلسه:</label>
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="نظر خود را در جلسه بیان کنید..."
                  className="bg-slate-700/60 border-slate-600 text-white placeholder-slate-400 focus-enhanced min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base shadow-inner"
                  disabled={isTyping || showingMessages}
                />
                {showingMessages && (
                  <p className="text-blue-400 text-xs mt-2">⏳ لطفاً تا پایان نمایش پیام‌ها صبر کنید...</p>
                )}
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping || showingMessages}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg h-fit transition-enhanced disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full md:w-auto"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  {isTyping ? 'در حال ارسال...' : showingMessages ? 'در حال نمایش...' : 'صحبت کنید'}
                </Button>
              </div>
            </div>
          </div>

          {/* Meeting Log - ریسپانسیو */}
          <div className="mt-4 md:mt-6 bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-600/30 max-h-32 md:max-h-40 overflow-y-auto animate-fadeIn">
            <h3 className="text-white font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              تاریخچه کامل جلسه
            </h3>
            <div className="space-y-1 md:space-y-2">
              {messages.slice(-5).map((message, index) => (
                <div key={message.id || index} className="text-slate-300 text-xs md:text-sm p-2 bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-blue-300">
                    {message.character || (message.type === 'user' ? 'شما' : 'سیستم')}:
                  </span>
                  <span className="mr-2 break-words">{message.content.slice(0, 100)}{message.content.length > 100 ? '...' : ''}</span>
                  <span className="text-xs text-slate-400 mr-2 block md:inline">
                    ({message.timestamp.toLocaleTimeString('fa-IR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })})
                  </span>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-slate-400 text-center py-4 text-xs md:text-sm">هنوز صحبتی در جلسه نشده است...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndependenceAssessment;
