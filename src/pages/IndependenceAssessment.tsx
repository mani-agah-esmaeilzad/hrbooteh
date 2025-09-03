'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- INTERFACES ---
interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  character?: string;
}

interface ServerMessage {
    type: string;
    content: string;
    character: string;
    timestamp: string;
    id: string;
}

// --- COMPONENT ---
const IndependenceAssessment = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initialAiMessages, setInitialAiMessages] = useState<ServerMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(true);
  const [notificationSound, setNotificationSound] = useState<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scenarioInfo = {
    category: "سناریوی استقلال در محیط کار",
    context: "شما در یک جلسه مهم برای تصمیم‌گیری درباره آینده یک محصول کلیدی شرکت دارید.",
    characters: [
        { name: 'آقای توحیدی', role: 'مدیر بخش', avatar: '👨‍💼' },
        { name: 'سارا', role: 'طراح تیم', avatar: '👩‍💻' },
        { name: 'احمد', role: 'مسئول کیفیت', avatar: '👨‍🔧' },
    ]
  };

  // --- EFFECTS ---
  useEffect(() => {
    setNotificationSound(new Audio('https://cdn.jsdelivr.net/gh/ksh-code/sample-audio-files@main/notification.mp3'));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user) {
      startChatSession();
    } else {
      router.push('/login');
    }
  }, [user]);

  useEffect(() => {
    if (assessmentStarted && initialAiMessages.length > 0) {
      displayMessagesSequentially(initialAiMessages);
    }
  }, [assessmentStarted, initialAiMessages]);

  // --- FUNCTIONS ---
  const playNotification = () => {
    // Use Web Audio API to create a simple beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.log('Notification sound not available:', err);
      // Fallback: no sound, just continue silently
    }
  };

  const displayMessagesSequentially = (msgs: ServerMessage[]) => {
    setIsTyping(true);
    let delay = 1000;
    msgs.forEach((msg, index) => {
      setTimeout(() => {
        if (index === msgs.length - 1) setIsTyping(false);
        setMessages((prev) => [...prev, { type: 'ai', content: msg.content, character: msg.character }]);
        playNotification();
      }, delay);
      delay += 2000;
    });
  };

  const startChatSession = async () => {
    setLoading(true);
    try {
      // Use new Mr. Ahmadi AI Chat API
      const response = await fetch('/api/ai-chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'کاربر'
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to start session');
      
      setSessionId(data.sessionId);
      // Create a message in the format expected by displayMessagesSequentially
      const aiMessage = {
        type: 'ai',
        content: data.message,
        character: 'آقای احمدی',
        timestamp: data.timestamp,
        id: 'initial'
      };
      setInitialAiMessages([aiMessage]);
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast.error("خطا در شروع ارزیابی. لطفاً صفحه را رفرش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    if (!sessionId) {
      toast.error("جلسه چت هنوز شروع نشده است. لطفاً چند لحظه صبر کنید.");
      return;
    }

    const userMessage: ChatMessage = { type: 'user', content: currentMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage.trim();
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Use new Mr. Ahmadi AI Chat API
      const response = await fetch('/api/ai-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: sessionId, 
          message: messageToSend 
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || data.message || 'Server error');
      handleServerResponse(data);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("خطا در ارسال پیام.");
      setIsTyping(false);
    }
  };

  const handleServerResponse = (data: any) => {
    console.log('Server response:', data); // Debug log
    
    if (data.type === 'final_analysis') {
      toast.success("ارزیابی تکمیل شد. در حال انتقال به صفحه نتایج...");
      localStorage.setItem('independence_results', JSON.stringify({ final_analysis: data.analysis || data }));
      setTimeout(() => router.push('/results'), 1500);
    } else if (data.message) {
      // Handle single AI message response (from new API)
      const aiMessage: ChatMessage = { 
        type: 'ai', 
        content: data.message, 
        character: 'آقای احمدی' 
      };
      setMessages(prev => [...prev, aiMessage]);
      playNotification();
      setIsTyping(false);
      
      // Check if analysis should be triggered
      if (data.shouldAnalyze) {
        // Could trigger analysis endpoint here in future
        console.log('Analysis should be triggered');
      }
    } else if (data.messages && Array.isArray(data.messages)) {
      // Handle multiple messages (for backward compatibility)
      displayMessagesSequentially(data.messages);
    } else {
      setIsTyping(false);
    }
  };

  // --- RENDER ---
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>در حال بارگذاری سناریو...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Dialog open={isIntroModalOpen && !loading}>
        <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-lg border-gray-200 rounded-2xl shadow-luxury">
           <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-gray-800">{scenarioInfo.category}</DialogTitle>
            <DialogDescription className="text-gray-600 pt-2 mx-auto max-w-sm">{scenarioInfo.context}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <h3 className="font-semibold text-center text-lg mb-4 text-gray-800">شخصیت‌های کلیدی جلسه</h3>
              <div className="flex justify-around items-start text-center">
                {scenarioInfo.characters.map(char => (
                  <div key={char.name} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl shadow-md">{char.avatar}</div>
                    <p className="font-bold text-sm text-gray-900">{char.name}</p>
                    <p className="text-xs text-gray-500">{char.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setIsIntroModalOpen(false); setAssessmentStarted(true); }} className="w-full bg-blue-600 text-white hover:bg-blue-700 text-lg py-6">
              شروع ارزیابی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-bold text-gray-800">جلسه ارزیابی استقلال</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}><ArrowLeft className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type !== 'user' && <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-base font-bold shrink-0">{msg.character?.charAt(0)}</div>}
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>
                {msg.character && msg.type !== 'user' && <p className="text-sm font-bold mb-1 text-gray-700">{msg.character}</p>}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-sm text-gray-500 pl-12">در حال تایپ...</div>}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Textarea value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} placeholder="پاسخ خود را بنویسید..." className="flex-1 rounded-full border-gray-300 px-4 py-2 resize-none" rows={1} disabled={isTyping || !assessmentStarted} />
            <Button onClick={handleSendMessage} disabled={isTyping || !currentMessage.trim()} className="rounded-full w-12 h-12"><Send className="w-5 h-5" /></Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndependenceAssessment;