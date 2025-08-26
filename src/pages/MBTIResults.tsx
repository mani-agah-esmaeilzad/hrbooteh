'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Users, ArrowRight, Home, Star, Award, BarChart3, ArrowLeft, Share2, Download } from 'lucide-react';
import { MBTIAnalysisResult } from '@/lib/mbti-analysis';
import { Button } from '@/components/ui/button';

const iconMap = {
  User: Users,
  Heart: Target,
  Target: Target,
  Lightbulb: Brain,
  Star: Star
};

const MBTIResultsContent: React.FC = () => {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<MBTIAnalysisResult | null>(null);

  useEffect(() => {
    // اگر داده‌ای در URL نیست، از localStorage بخوان
    const savedAnalysis = localStorage.getItem('mbti_analysis');
    if (savedAnalysis) {
      try {
        const rawAnalysis = JSON.parse(savedAnalysis);

        // تبدیل فرمت قدیمی به جدید اگر لازم باشد
        // کد اصلاح شده
        const normalizedAnalysis: MBTIAnalysisResult = {
          personality_type: rawAnalysis.personality_type || 'UNKNOWN',
          description: rawAnalysis.description || 'توضیحی در دسترس نیست',
          type_name: rawAnalysis.type_name || 'نامشخص', // <-- این خط اضافه شده
          famous_people: rawAnalysis.famous_people || [], // <-- این خط اضافه شده
          detailedAnalysis: rawAnalysis.detailedAnalysis || {}, // <-- این خط اضافه شده
          E_I_score: rawAnalysis.E_I_score,
          S_N_score: rawAnalysis.S_N_score,
          T_F_score: rawAnalysis.T_F_score,
          P_J_score: rawAnalysis.P_J_score,
          dimensions: rawAnalysis.dimensions,
          strengths: rawAnalysis.strengths,
          challenges: rawAnalysis.challenges,
          development_areas: rawAnalysis.development_areas,
          career_suggestions: rawAnalysis.career_suggestions,
        };

        setAnalysis(normalizedAnalysis);
      } catch (error) {
        console.error('Error parsing saved analysis:', error);
        router.push('/');
        return;
      }
    } else {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setTimeout(() => setShowResults(true), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  const getPersonalityIcon = (type: string): string => {
    const firstLetter = type.charAt(0);
    switch (firstLetter) {
      case 'E': return 'User';
      case 'I': return 'Heart';
      case 'S': return 'Target';
      case 'N': return 'Lightbulb';
      default: return 'Star';
    }
  };

  const getPersonalityColor = (type: string): { color: string; bgColor: string } => {
    const firstLetter = type.charAt(0);
    switch (firstLetter) {
      case 'E': return { color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' };
      case 'I': return { color: 'from-blue-500 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50' };
      case 'S': return { color: 'from-green-500 to-teal-500', bgColor: 'from-green-50 to-teal-50' };
      case 'N': return { color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' };
      default: return { color: 'from-gray-500 to-gray-600', bgColor: 'from-gray-50 to-gray-100' };
    }
  };

  const getDimensionLabel = (dimension: string): string => {
    switch (dimension) {
      case 'E_I': return 'برون‌گرایی / درون‌گرایی';
      case 'S_N': return 'حسی / شهودی';
      case 'T_F': return 'تفکری / احساسی';
      case 'P_J': return 'ادراکی / قضاوتی';
      default: return dimension;
    }
  };

  const getDimensionValue = (dimension: string, score: number): string => {
    switch (dimension) {
      case 'E_I': return score > 0 ? `درون‌گرا (${score})` : `برون‌گرا (${Math.abs(score)})`;
      case 'S_N': return score > 0 ? `شهودی (${score})` : `حسی (${Math.abs(score)})`;
      case 'T_F': return score > 0 ? `احساسی (${score})` : `تفکری (${Math.abs(score)})`;
      case 'P_J': return score > 0 ? `قضاوتی (${score})` : `ادراکی (${Math.abs(score)})`;
      default: return score.toString();
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-6 space-y-8">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center animate-pulse">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-300 to-blue-300 rounded-3xl blur opacity-50 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              در حال تحلیل شخصیت MBTI...
            </h2>
            <p className="text-gray-600">
              هوش مصنوعی در حال تحلیل نوع شخصیت شماست
            </p>
          </div>
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // کد اصلاح شده
  const personalityColors = getPersonalityColor(analysis.personality_type);
  const iconName = getPersonalityIcon(analysis.personality_type) as keyof typeof iconMap;
  const PersonalityIcon = iconMap[iconName] || Star;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className={`h-6 bg-gradient-to-r ${personalityColors.color}`}></div>
      <div className="px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center btn-press"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">نتایج آزمون MBTI</h1>
              <p className="text-xs text-gray-500">تحلیل شخصیت</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center btn-press">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center btn-press">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className={`text-center space-y-4 ${showResults ? 'animate-scale-in' : 'opacity-0'}`}>
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">تحلیل شخصیت شما کامل شد!</h2>
            <p className="text-gray-600 text-sm">نوع شخصیت MBTI شما مشخص شد</p>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${personalityColors.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${personalityColors.color} rounded-2xl flex items-center justify-center`}>
              <PersonalityIcon className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {analysis.personality_type}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {analysis.description}
              </p>
            </div>
          </div>
        </div>

        {/* تحلیل ابعاد MBTI */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            تحلیل ابعاد شخصیتی
          </h3>

          <div className="space-y-4">
            {analysis.dimensions && Object.entries(analysis.dimensions).map(([dimension, score]) => (
              <div key={dimension} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getDimensionLabel(dimension)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {getDimensionValue(dimension, score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${score > 0 ? 'bg-blue-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.min(Math.abs(score) * 25, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* نقاط قوت */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              نقاط قوت شما
            </h3>
            <div className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نواحی توسعه */}
        {analysis.development_areas && analysis.development_areas.length > 0 && (
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              نواحی توسعه
            </h3>
            <div className="space-y-2">
              {analysis.development_areas.map((area, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* پیشنهادات شغلی */}
        {analysis.career_suggestions && analysis.career_suggestions.length > 0 && (
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              پیشنهادات شغلی
            </h3>
            <div className="space-y-2">
              {analysis.career_suggestions.map((career, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{career}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`space-y-3 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          <Button
            onClick={() => router.push('/independence')}
            className="w-full h-12 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium rounded-xl btn-press"
          >
            آزمون استقلال اقتصادی
          </Button>

          <Button
            onClick={() => router.push('/mbti')}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl btn-press"
          >
            تکرار آزمون MBTI
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium btn-press"
          >
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
      <div className="h-8"></div>
    </div>
  );
};

const MBTIResults: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center animate-pulse">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
      </div>
    </div>}>
      <MBTIResultsContent />
    </Suspense>
  );
};

export default MBTIResults;
