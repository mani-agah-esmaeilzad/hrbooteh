'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Users, Award, TrendingUp, Shield, Sparkles, ChevronRight, Star, BarChart3, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';


const Index = () => {
  const router = useRouter();
  const { user, setSelectedSkillId, setUser, setCurrentQuestionnaire } = useAuth();

  const questionnaires = [
    {
      id: 1,
      title: "ارزیابی استقلال",
      description: "سنجش میزان استقلال و خودکفایی شما در تصمیم‌گیری‌ها",
      icon: Shield,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-100"
    },
    {
      id: 2,
      title: "آزمون شخصیت MBTI",
      description: "شناخت نوع شخصیت شما بر اساس تست مایرز-بریگز با روش چت تعاملی",
      icon: Brain,
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-100"
    }
  ];

  const handleStartAssessment = async (questionnaireId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/self-assessment/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!data.completed) {
        router.push('/self-assessment');
        return;
      }
    } catch (error) {
      console.error('Error checking self-assessment status:', error);
      toast.error('خطا در بررسی وضعیت ارزیابی. لطفاً دوباره تلاش کنید.');
      return;
    }

    setCurrentQuestionnaire(questionnaireId);
    setSelectedSkillId(questionnaireId);
    
    // Route to specific assessment pages
    if (questionnaireId === 1) {
      router.push('/independence');
    } else if (questionnaireId === 2) {
      router.push('/mbti');
    } else {
      router.push('/assessment'); // fallback
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // ارسال درخواست logout به سرور
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      // پاک کردن اطلاعات محلی
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // به‌روزرسانی state
      setUser(null);
      
      toast.success('خروج موفقیت‌آمیز بود');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // حتی اگر خطا رخ داد، اطلاعات محلی پاک شود
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('خروج انجام شد');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-executive-pearl via-white to-executive-silver/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-executive-navy rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-executive-gold rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 bg-white/90 backdrop-blur-xl border-b border-executive-ash-light/30">
        <div className="max-w-full mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-executive-navy to-executive-navy-light rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-executive-charcoal leading-tight">سامانه ارزیابی مهارت‌های حرفه‌ای</h1>
              <p className="text-executive-ash text-xs">تحلیل دقیق و علمی مهارت‌های شما</p>
            </div>
          </div>
          
          {!user ? (
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-executive-navy to-executive-navy-light text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              ورود به سیستم
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-executive-gold-light/20 px-4 py-2 rounded-xl border border-executive-gold/20">
                <div className="w-8 h-8 bg-gradient-to-br from-executive-gold to-executive-gold-light rounded-lg flex items-center justify-center">
                  <span className="text-executive-charcoal font-bold text-sm">{user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
                </div>
                <span className="text-executive-charcoal font-medium">خوش آمدید، {user?.first_name || user?.username || 'کاربر'}</span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/80 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all duration-300"
              >
                خروج
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-executive-gold-light/30 text-executive-charcoal px-4 py-2 rounded-full border border-executive-gold/30 mb-6">
            <Sparkles className="w-4 h-4 text-executive-gold" />
            <span className="text-sm font-semibold">سیستم ارزیابی هوشمند</span>
          </div>
          
          <h2 className="text-5xl font-bold text-executive-charcoal mb-6 leading-tight">
            مهارت‌های خود را
            <span className="text-transparent bg-gradient-to-r from-executive-navy to-executive-gold bg-clip-text"> دقیق بسنجید</span>
          </h2>
          
          <p className="text-xl text-executive-ash max-w-3xl mx-auto leading-relaxed mb-8">
            با استفاده از روش‌های علمی و هوش مصنوعی، سطح مهارت‌های حرفه‌ای خود را ارزیابی کرده و گزارش جامع دریافت کنید
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-executive-ash-light/30 shadow-subtle">
              <div className="w-12 h-12 bg-executive-navy/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-executive-navy" />
              </div>
              <h3 className="text-2xl font-bold text-executive-charcoal mb-2">+۱۰,۰۰۰</h3>
              <p className="text-executive-ash">کاربر فعال</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-executive-ash-light/30 shadow-subtle">
              <div className="w-12 h-12 bg-executive-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-executive-gold" />
              </div>
              <h3 className="text-2xl font-bold text-executive-charcoal mb-2">۹۸٪</h3>
              <p className="text-executive-ash">دقت ارزیابی</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-executive-ash-light/30 shadow-subtle">
              <div className="w-12 h-12 bg-executive-navy/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-executive-navy" />
              </div>
              <h3 className="text-2xl font-bold text-executive-charcoal mb-2">+۵۰</h3>
              <p className="text-executive-ash">مهارت قابل ارزیابی</p>
            </div>
          </div>
        </div>

        {/* Questionnaire Selection */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto mb-12">
            <h3 className="text-3xl font-bold text-executive-charcoal mb-6">انتخاب نوع ارزیابی</h3>
            <p className="text-executive-ash text-lg mb-12">
              نوع ارزیابی مورد نظر خود را انتخاب کنید و با هوش مصنوعی پیشرفته، تحلیل جامع دریافت نمایید
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {questionnaires.map((questionnaire) => {
                const IconComponent = questionnaire.icon;
                return (
                  <div
                    key={questionnaire.id}
                    className={`bg-gradient-to-br ${questionnaire.bgColor} rounded-3xl p-8 border border-white/50 shadow-subtle hover:shadow-luxury transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
                    onClick={() => handleStartAssessment(questionnaire.id)}
                  >
                    <div className={`w-20 h-20 bg-gradient-to-br ${questionnaire.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    
                    <h4 className="text-2xl font-bold text-executive-charcoal mb-4">{questionnaire.title}</h4>
                    <p className="text-executive-ash text-lg leading-relaxed mb-8">
                      {questionnaire.description}
                    </p>
                    
                    <Button
                      className={`bg-gradient-to-r ${questionnaire.color} text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full group-hover:scale-105`}
                    >
                      شروع آزمون
                      <ArrowRight className="w-6 h-6 mr-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-executive-navy/10 to-executive-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-executive-navy/20 group-hover:to-executive-navy/10 transition-all duration-300">
              <TrendingUp className="w-8 h-8 text-executive-navy" />
            </div>
            <h4 className="text-xl font-bold text-executive-charcoal mb-3">ارزیابی دقیق</h4>
            <p className="text-executive-ash leading-relaxed">
              با استفاده از الگوریتم‌های پیشرفته و روش‌های علمی، دقیق‌ترین ارزیابی را دریافت کنید
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-executive-gold/10 to-executive-gold/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-executive-gold/20 group-hover:to-executive-gold/10 transition-all duration-300">
              <Award className="w-8 h-8 text-executive-gold" />
            </div>
            <h4 className="text-xl font-bold text-executive-charcoal mb-3">گزارش جامع</h4>
            <p className="text-executive-ash leading-relaxed">
              گزارش کاملی از نقاط قوت، ضعف و راهکارهای بهبود مهارت‌های خود دریافت کنید
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-executive-charcoal/10 to-executive-charcoal/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-executive-charcoal/20 group-hover:to-executive-charcoal/10 transition-all duration-300">
              <Shield className="w-8 h-8 text-executive-charcoal" />
            </div>
            <h4 className="text-xl font-bold text-executive-charcoal mb-3">امنیت بالا</h4>
            <p className="text-executive-ash leading-relaxed">
              اطلاعات شما با بالاترین استانداردهای امنیتی محافظت و نگهداری می‌شود
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;